/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isBooleanAttribute } from '@lwc/shared';
import {
    parseTemplate,
    isVoidElement,
    isLightRenderMode,
    type ParsedNode,
    type ParsedElement,
} from './parser';
import {
    IRNodeTypes,
    type RootIR,
    type BlockIR,
    type OperationIR,
    type EffectIR,
    type NodeRef,
    type Accessor,
    type InsertTarget,
    type ForIR,
    type IfIR,
} from './ir';
import type { VaporCompileOptions } from './compile';

// Delegatable events (bubble and can be caught at document level)
const DELEGATABLE_EVENTS = new Set([
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'keydown',
    'keyup',
    'keypress',
    'input',
    'change',
    'submit',
]);

// Form elements whose `value`/`checked` attributes set the *default* value; LWC
// treats authored `value`/`checked` as live properties instead of attributes.
const INPUT_PROP_ELEMENTS = new Set(['input', 'textarea', 'select', 'option']);

/**
 * Module-level counters reset per-compile. They produce globally-unique variable
 * names so that no two declarations collide, regardless of block nesting.
 */
let elemVarCounter = 0;
let dynVarCounter = 0;
// Set when a `<use href>`/`<use xlink:href>` inside <svg> emits a `sanitizeAttribute`
// call, so codegen imports it from 'lwc'. Reset per transform run.
let usesSanitizeAttribute = false;

// The SVG namespace URI, passed to `sanitizeAttribute(tag, ns, attr, value)` so a
// Locker-patched sanitizer can match SVG-use hrefs. Mirrors the standard compiler.
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/** `<use href>` / `<use xlink:href>` inside an <svg> subtree — the only case the
 *  legacy `sanitizeAttribute` hook applies to (mirrors template-compiler's
 *  isSvgUseHref: tag===use, attr in {href, xlink:href}, SVG namespace). */
function isSvgUseHref(tag: string, attr: string, inSvg: boolean): boolean {
    return inSvg && tag === 'use' && (attr === 'href' || attr === 'xlink:href');
}

function freshElemVar(): string {
    return `n${elemVarCounter++}`;
}

/**
 * Find the first `key={...}` directive within a `for:each` body, descending through
 * conditional wrappers (`lwc:if`/`elseif`/`else`, incl. folded `negativeChain`
 * branches) since the keyed element may be nested inside them. Returns the key
 * expression or undefined. This is what lets a keyed `for:each` over conditional
 * items reconcile by key (not index).
 */
function findForKey(nodes: ParsedNode[]): string | undefined {
    for (const node of nodes) {
        if (node.type !== 'element') continue;
        const el = node.data;
        if (el.forKey) return el.forKey;
        // Descend into the element's own children (covers `<template lwc:if>` wrappers
        // whose child holds the key).
        const childKey = findForKey(el.children);
        if (childKey) return childKey;
        // Folded elseif/else branches hang off the lwc:if element's negativeChain.
        if (el.negativeChain) {
            for (const branch of el.negativeChain) {
                if (branch.node.forKey) return branch.node.forKey;
                const k = findForKey(branch.node.children);
                if (k) return k;
            }
        }
    }
    return undefined;
}
function freshDynVar(): string {
    return `d${dynVarCounter++}`;
}

export function transform(
    source: string,
    _options: VaporCompileOptions,
    warnings: string[]
): RootIR {
    elemVarCounter = 0;
    dynVarCounter = 0;
    usesSanitizeAttribute = false;
    const templates: string[] = [];

    const rootChildren = parseTemplate(source, warnings, {
        experimentalComplexExpressions: _options.experimentalComplexExpressions,
    });
    const block = transformBlock(rootChildren, templates);

    return {
        type: IRNodeTypes.ROOT,
        templates,
        block,
        renderMode: isLightRenderMode() ? 'light' : 'shadow',
        usesSanitizeAttribute,
    };
}

/**
 * A block corresponds to one static template plus the dynamic operations that
 * patch it. Control-flow nodes (if/for/slot/component) are NOT part of the
 * static template; they become standalone variables inserted at their anchor.
 */
function transformBlock(
    rawChildren: ParsedNode[],
    templates: string[],
    /** True when this block is a component's SLOT CONTENT (projected into a child's
     *  light DOM). A legacy `if:true`/`if:false` here must emit ZERO bookends even as
     *  the lone single-root child — otherwise its comment anchor leaks into the host's
     *  light DOM and corrupts `innerHTML` (#663). For ordinary blocks (e.g. a for-each
     *  body) the harmless comment anchor is kept so per-item positioning is preserved. */
    isSlotContent = false
): BlockIR {
    // Fold lwc:elseif / lwc:else siblings into the preceding lwc:if element's
    // `negativeChain`, and drop them from the child list, so the if-chain is a
    // single control-flow node.
    const children = foldElseChains(rawChildren);

    const operations: OperationIR[] = [];
    const effects: EffectIR[] = [];
    const nodeRefs: NodeRef[] = [];
    const returns: string[] = [];

    // The static HTML for this block, accumulated across top-level children.
    let staticHtml = '';
    // The block root variable. For a single top-level node it is that node; for
    // multiple top-level nodes it is the cloned fragment, and each top-level node
    // is reached via nthChild(rootVar, i).
    let rootVar: string | null = null;

    // ANCHORLESS for:each (engine-core `api_iterator`): a top-level `for:each` in a
    // multi-root block emits NO `<!---->` delimiter — it occupies no slot in the
    // static template. So we track the static-template slot index (`staticIdx`,
    // advanced only for nodes that emit static HTML) SEPARATELY from the logical
    // top-level position. `topLevelEntries` records every top-level child's runtime
    // "firstNode" expression in document order, so an anchorless for can resolve the
    // node it must stay before (its next sibling) in a post-pass.
    let staticIdx = 0;
    interface TopEntry {
        /** Variable name for this entry (a static node ref, or a control-flow block var). */
        varName: string;
        /** True when `varName` is a control-flow BLOCK (if/for/slot/component) whose
         *  first DOM node must be resolved at runtime via `firstNode(varName)`; false
         *  for a static node whose var IS its first node. */
        isBlock: boolean;
        /** True when this entry is a STATIC text or comment node (which would MERGE
         *  with an adjacent static text/comment node if the node between them is
         *  omitted — see anchorless eligibility below). */
        isStaticText?: boolean;
        /** The anchorless control-flow IR (ForIR or IfIR) to patch with its
         *  next-sibling ref, if this entry is one. */
        cfOp?: ForIR | IfIR;
    }
    const topLevelEntries: TopEntry[] = [];

    // Does a child render as a STATIC text/comment node (no own delimiter)? Used to
    // detect the text-merge hazard: omitting an anchorless `for:each`'s delimiter
    // between two such nodes would collapse them into ONE text node at `innerHTML`
    // time, breaking the `nthChild` positions. In that case the for keeps a comment
    // anchor (non-anchorless).
    const childIsStaticText = (c: ParsedNode): boolean => {
        if (c.type === 'text') return true; // dynamic-text placeholder OR static text
        if (c.type === 'comment') return true;
        return false;
    };
    // Index of the NEXT rendered top-level child after position `from` (skips
    // whitespace-only static text, matching what the loop renders).
    const nextRenderedChild = (from: number): ParsedNode | undefined => {
        for (let j = from + 1; j < children.length; j++) {
            const c = children[j];
            if (c.type === 'text' && !c.data.dynamic && c.data.content.trim() === '') continue;
            return c;
        }
        return undefined;
    };

    // Whether this block has more than one top-level RENDERED root (=> fragment).
    // An anchorless `for:each` does NOT occupy a static slot, but it IS a rendered
    // root, so it counts toward multiRoot (a lone `for:each` stays single-root).
    const countTopLevel = () => {
        let n = 0;
        for (const c of children) {
            if (c.type === 'text') {
                if (c.data.dynamic || c.data.content.trim() !== '') n++;
            } else {
                n++; // elements, control-flow anchors, AND anchorless fors each count
            }
        }
        return n;
    };
    const multiRoot = countTopLevel() > 1;

    // Path from the block root to the static node at template index `i` (multiRoot
    // clones a fragment; single-root the node IS the root).
    const topLevelPath = (index: number): Accessor[] => {
        if (!multiRoot) return []; // the node IS the root
        return [{ kind: 'nthChild', index }];
    };

    for (let childIdx = 0; childIdx < children.length; childIdx++) {
        const child = children[childIdx];
        if (child.type === 'text') {
            if (child.data.dynamic) {
                ensureRootVar();
                const idx = staticIdx++;
                staticHtml += ' ';
                const ref: string = idx === 0 && !multiRoot ? rootVar! : freshElemVar();
                if (ref !== rootVar) {
                    nodeRefs.push({ varName: ref, path: topLevelPath(idx) });
                }
                effects.push({
                    operations: [
                        { type: IRNodeTypes.SET_TEXT, ref, expression: child.data.expression! },
                    ],
                });
                returns.push(multiRoot ? '' : ref); // multi-root returns whole fragment root
                topLevelEntries.push({ varName: ref, isBlock: false, isStaticText: true });
            } else if (child.data.content.trim() !== '') {
                ensureRootVar();
                const idx = staticIdx++;
                staticHtml += child.data.content;
                // A static text node is still a rendered root: it must be
                // returned (and, for single-root blocks, IS the root node).
                const ref: string = idx === 0 && !multiRoot ? rootVar! : freshElemVar();
                if (ref !== rootVar) {
                    nodeRefs.push({ varName: ref, path: topLevelPath(idx) });
                }
                if (!multiRoot) returns.push(ref);
                topLevelEntries.push({ varName: ref, isBlock: false, isStaticText: true });
            }
            continue;
        }

        // Preserved HTML comment (`lwc:preserve-comments`): emit a static comment
        // node. It counts as a rendered root for path/return bookkeeping.
        if (child.type === 'comment') {
            ensureRootVar();
            const idx = staticIdx++;
            staticHtml += `<!--${child.data.content}-->`;
            const ref: string = idx === 0 && !multiRoot ? rootVar! : freshElemVar();
            if (ref !== rootVar) {
                nodeRefs.push({ varName: ref, path: topLevelPath(idx) });
            }
            if (!multiRoot) returns.push(ref);
            topLevelEntries.push({ varName: ref, isBlock: false, isStaticText: true });
            continue;
        }

        const elem = child.data;

        // --- Control flow / component / slot at the top level of the block ---
        const cf = controlFlowKind(elem);
        if (cf) {
            // ANCHORLESS for:each in a multi-root block: emit NO `<!---->` delimiter.
            // The list inserts its items before its next sibling (resolved in a
            // post-pass) — engine-core `api_iterator` shape (zero bookends).
            //
            // SAFETY: only go anchorless when omitting the delimiter won't MERGE two
            // adjacent static text/comment nodes (which would collapse them into one
            // text node at `innerHTML` time and corrupt the `nthChild` positions). That
            // hazard exists only when BOTH the preceding rendered entry AND the next
            // rendered child are static text/comment. Otherwise keep a comment anchor.
            const prevEntryStatic =
                topLevelEntries.length > 0 &&
                topLevelEntries[topLevelEntries.length - 1].isStaticText === true;
            const nextChild = nextRenderedChild(childIdx);
            const nextStatic = nextChild !== undefined && childIsStaticText(nextChild);
            const textMergeHazard = prevEntryStatic && nextStatic;
            // A LEGACY `if:true`/`if:false` emits ZERO `<!---->` bookends in engine-dom
            // (unlike `lwc:if`, which brackets its content). It must therefore go
            // anchorless ALWAYS — even as the lone child of a single-root block (e.g. a
            // slot-content block: `<template if:true>` passed to a child). Otherwise its
            // persistent comment anchor leaks into the host's light DOM (#663).
            const legacyIf = cf === 'if' && elem.ifLegacy === true && isSlotContent;
            // A control-flow block that is SLOT CONTENT must suppress its OWN bookends:
            // engine-core's `flattenFragmentsInChildren` strips a slotted conditional's /
            // iterator's delimiters at allocation (before distribution), so the receiving
            // `<slot>` provides the only pair. Without this, the conditional's bookends
            // leak into the child's projected content — visible for SHADOW children where
            // no light-DOM flatten pass runs (rendering/slot-not-at-top-level). Going
            // anchorless+noBookends here matches engine-dom for both shadow and light.
            // Scoped to `if` only: a slotted `for:each` already positions correctly via
            // its non-anchorless delimiter and forcing it anchorless breaks keyed reorder
            // (light-dom/slotting "should render dynamic children"). A slotted `lwc:if`,
            // by contrast, must drop its bracketing bookends to match engine-dom.
            const slotContentCF = isSlotContent && cf === 'if';
            if (
                (cf === 'for' || cf === 'if') &&
                (multiRoot || legacyIf || slotContentCF) &&
                !textMergeHazard
            ) {
                // Do NOT force a rootVar: an anchorless control-flow block that is the
                // ONLY top-level content (no static template) is RETURNED, not inserted
                // into a (nonexistent) cloned fragment. The `insertInto.parentRef` is
                // patched in the post-pass once we know whether a static root exists.
                const op = buildControlFlowOp(elem, cf, undefined, templates, isSlotContent) as
                    ForIR | IfIR;
                op.anchorless = true;
                // Slot-content conditionals/iterators render NO bookends of their own.
                if (slotContentCF || legacyIf) op.noBookends = true;
                operations.push(op);
                topLevelEntries.push({ varName: op.varName, isBlock: true, cfOp: op });
                continue;
            }
            if (multiRoot) {
                // Occupies a comment-anchor slot in the fragment; insert there.
                ensureRootVar();
                const idx = staticIdx++;
                staticHtml += '<!---->';
                const anchorRef = freshElemVar();
                nodeRefs.push({ varName: anchorRef, path: topLevelPath(idx) });
                const op = buildControlFlowOp(
                    elem,
                    cf,
                    { parentRef: rootVar!, anchorRef },
                    templates,
                    isSlotContent
                );
                operations.push(op);
                topLevelEntries.push({ varName: getOpVarName(op), isBlock: true });
            } else {
                const op = buildControlFlowOp(elem, cf, undefined, templates, isSlotContent);
                operations.push(op);
                returns.push(getOpVarName(op));
                topLevelEntries.push({ varName: getOpVarName(op), isBlock: true });
            }
            continue;
        }

        // --- Plain element (part of the static template) ---
        ensureRootVar();
        const idx = staticIdx++;
        const thisRef: string = idx === 0 && !multiRoot ? rootVar! : freshElemVar();
        if (thisRef !== rootVar) {
            nodeRefs.push({ varName: thisRef, path: topLevelPath(idx) });
        }
        staticHtml += buildElementHtml(elem, thisRef, nodeRefs, operations, effects, templates);
        if (!multiRoot) returns.push(thisRef);
        topLevelEntries.push({ varName: thisRef, isBlock: false });
    }

    // POST-PASS: resolve each anchorless for:each's next-sibling expression. The list
    // must stay BEFORE the first DOM node of the FOLLOWING top-level entry. A static
    // node's firstNode IS the node var; a control-flow block's is `firstNode(varName)`
    // (resolved at runtime). If the for is the last top-level entry, it appends (null).
    for (let i = 0; i < topLevelEntries.length; i++) {
        const entry = topLevelEntries[i];
        if (!entry.cfOp) continue;
        const cfOp = entry.cfOp;
        const nextEntry = topLevelEntries[i + 1];
        if (!nextEntry) {
            // Last top-level child → the list appends at the parent's end.
            cfOp.nextSiblingRef = 'null';
        } else if (nextEntry.isBlock) {
            // Next sibling is a control-flow block (if/for/slot/component) — resolve its
            // current first DOM node at runtime (it may be empty/toggled).
            cfOp.nextSiblingRef = `firstNode(${nextEntry.varName})`;
        } else {
            // Next sibling is a static node — its var IS its first node.
            cfOp.nextSiblingRef = nextEntry.varName;
        }
        // Preceding sibling's LAST node — used to resolve the REAL parent when this
        // block is empty and has no usable next sibling (the recorded mount container
        // may be a cloned fragment that was emptied when its nodes moved into the real
        // root; a preceding sibling's node stays live there). Needed by BOTH for:each
        // and lwc:if (an anchorless if can be empty at a position where next=null).
        {
            const prevEntry = topLevelEntries[i - 1];
            if (!prevEntry) {
                cfOp.prevSiblingRef = 'null';
            } else if (prevEntry.isBlock) {
                cfOp.prevSiblingRef = `lastNode(${prevEntry.varName})`;
            } else {
                cfOp.prevSiblingRef = prevEntry.varName;
            }
        }
        // Route the anchorless op's mount: if a STATIC template root exists, insert its
        // content into that cloned fragment (`insertInto.parentRef = rootVar`); else the
        // block has NO static root, so RETURN the fragment (the parent positions it).
        if (rootVar !== null && staticHtml !== '') {
            cfOp.insertInto = { parentRef: rootVar, anchorRef: '' };
        } else {
            returns.push(cfOp.varName);
        }
    }

    const templateIndex = templates.length;
    templates.push(staticHtml);

    // A block has a static template if any element/text (including a dynamic-text
    // placeholder, which is a single space) was emitted. We must NOT trim here:
    // a placeholder-only template (" ") still needs to create that text node.
    const hasStatic = rootVar !== null && staticHtml !== '';

    // For multi-root blocks the single returned node is the fragment root.
    const finalReturns = multiRoot
        ? hasStatic
            ? [rootVar!]
            : returns.filter(Boolean)
        : returns.filter(Boolean);

    return {
        type: IRNodeTypes.BLOCK,
        templateIndex: hasStatic ? templateIndex : -1,
        multiRoot: multiRoot && hasStatic,
        rootVar: rootVar ?? undefined,
        nodeRefs,
        operations,
        effects: batchEffects(effects),
        returns: finalReturns,
    };

    function ensureRootVar() {
        if (rootVar === null) {
            rootVar = freshElemVar();
        }
    }
}

/**
 * Effect BATCHING (mount-cost optimization, mirrors Vue vapor's per-block effect model).
 *
 * The compiler emits ONE {@link EffectIR} per reactive binding, and each becomes one
 * runtime `ReactiveEffect`. For a `for:each` body that is N effects PER ROW — the
 * js-framework-benchmark table row emits 4 (data-id, class, text=id, text=label) →
 * create-10k allocates 40k ReactiveEffects (+ per-effect deps arrays / dep-set
 * subscriptions). That per-effect SETUP is the dominant reason vapor loses the mount
 * ops (create-10k) to classic engine-core, which uses ONE coarse observer per component.
 *
 * Folding consecutive bindings into a SINGLE multi-op effect (`generateEffect` already
 * emits `renderEffect(() => { opA; opB; ... })` for `operations.length > 1`) cuts that
 * setup proportionally (4→1 for the krausest row). This is SAFE for the update ops
 * vapor already wins (select-row, partial-update) ONLY because every batchable runtime
 * op MEMOIZES: setText (`$txt`), setAttr (`$<key>`), setClass (`$clsRaw` string fast
 * path), setStyle (`$sty`), and setProp (prop cache / `prev !== value`) all early-return
 * on an unchanged value. So when a merged effect re-runs for ONE changed dep, the other
 * ops are cheap equality-checks, not DOM writes — the fine-grained update advantage is
 * preserved. Vue vapor relies on exactly this per-op memoization to batch per block.
 *
 * BARRIERS (never merged — kept as their own standalone effect, and they SPLIT a run so
 * relative execution order is preserved bit-for-bit):
 *  - form-prop `value`/`checked` (SET_PROP): engine-core RE-ASSERTS these every render
 *    without an equality guard, to overwrite a user-mutated live DOM value. Merging would
 *    make an unrelated dep change re-fire the write and clobber user input.
 *  - external props/spread (`external`, SET_DYNAMIC_PROPS): heuristic prop-vs-attr with
 *    dev-warning side effects; not value-memoized.
 *  - SET_HTML (innerHTML rebuild), LWC_ON (event-map spread): not idempotent DOM writes.
 * Only same-`ref` runs are merged, so an effect never mixes bindings for two elements.
 */
const BATCH_SAFE_TYPES: ReadonlySet<IRNodeTypes> = new Set([
    IRNodeTypes.SET_ATTR,
    IRNodeTypes.SET_CLASS,
    IRNodeTypes.SET_STYLE,
    IRNodeTypes.SET_TEXT,
]);

function isBatchable(effect: EffectIR): boolean {
    // Only single-op effects are candidates (multi-op effects are already batched, e.g.
    // the SVG-use sanitize path — leave them as-is).
    if (effect.operations.length !== 1) return false;
    const op = effect.operations[0];
    if (BATCH_SAFE_TYPES.has(op.type)) return true;
    // A plain (non-external) prop that is NOT a live-binding form prop is value-memoized
    // by setProp, so it is safe to fold. `value`/`checked` re-assert every render → barrier.
    if (op.type === IRNodeTypes.SET_PROP) {
        return !op.external && op.prop !== 'value' && op.prop !== 'checked';
    }
    return false;
}

/**
 * Merge maximal CONSECUTIVE runs of same-`ref` batch-safe effects into one multi-op
 * effect. Consecutive-only + same-ref keeps every operation in its original relative
 * order, so codegen output is behavior-identical aside from sharing one renderEffect.
 */
function batchEffects(effects: EffectIR[]): EffectIR[] {
    if (effects.length < 2) return effects;
    const out: EffectIR[] = [];
    let run: OperationIR[] | null = null;
    let runRef: string | null = null;
    const flush = () => {
        if (run) {
            out.push({ operations: run });
            run = null;
            runRef = null;
        }
    };
    for (const effect of effects) {
        if (isBatchable(effect)) {
            // `ref` exists on every batch-safe op type (SET_ATTR/CLASS/STYLE/TEXT/PROP).
            const ref = (effect.operations[0] as { ref: string }).ref;
            if (run && ref === runRef) {
                run.push(effect.operations[0]);
            } else {
                flush();
                run = [effect.operations[0]];
                runRef = ref;
            }
        } else {
            // A barrier: emit any open run, then the barrier effect verbatim.
            flush();
            out.push(effect);
        }
    }
    flush();
    return out;
}

/**
 * Folds consecutive lwc:elseif / lwc:else sibling elements into the preceding
 * lwc:if element's `negativeChain`. Whitespace-only text nodes between the
 * branches are skipped. Returns a new child list with the else-branches removed.
 */
function foldElseChains(children: ParsedNode[]): ParsedNode[] {
    const result: ParsedNode[] = [];
    let currentIf: ParsedElement | null = null;
    for (const child of children) {
        if (child.type === 'text') {
            // Whitespace between branches doesn't break the chain.
            if (child.data.content.trim() === '' && !child.data.dynamic) {
                result.push(child);
                continue;
            }
            currentIf = null;
            result.push(child);
            continue;
        }
        if (child.type === 'comment') {
            // A preserved comment doesn't break an if/elseif/else chain.
            result.push(child);
            continue;
        }
        const el = child.data;
        if (el.elseifCondition !== undefined || el.isElse) {
            if (currentIf) {
                (currentIf.negativeChain ??= []).push({
                    condition: el.isElse ? null : el.elseifCondition!,
                    node: el,
                });
                // An elseif can itself be followed by further elseif/else.
                continue;
            }
            // Orphan elseif/else (no preceding if) — render as plain element.
            result.push(child);
            continue;
        }
        if (el.ifCondition !== undefined) {
            currentIf = el;
        } else {
            currentIf = null;
        }
        result.push(child);
    }
    return result;
}

type ControlFlowKind = 'if' | 'for' | 'slot' | 'component';

/** Identify whether a parsed element is a control-flow / component / slot node. */
function controlFlowKind(elem: ParsedElement): ControlFlowKind | null {
    if (elem.ifCondition) return 'if';
    if (elem.forEachSource || elem.iteratorName) return 'for';
    if (elem.tag === 'slot') {
        // LIGHT components have no shadow root → no native projection. EVERY
        // `<slot>` must compile to a `createSlot` block so it's a tracked node
        // (correct teardown when nested in lwc:if/for, forwarding, dynamic names).
        if (isLightRenderMode()) return 'slot';
        // SHADOW mode: a SCOPED slot (`lwc:slot-bind`) is a render-function mechanism
        // (the child invokes the parent's content fn with bound data) — needs createSlot.
        // A FORWARDING `<slot slot="Y">` (static OR dynamic `slot={expr}`) WITHOUT
        // slot-bind stays a real `<slot>` element: the browser natively projects content
        // INTO it AND the `<slot>` element itself (carrying `slot="Y"`) is distributed up
        // into the enclosing host's slot — so no createSlot/comment-bookend conversion is
        // needed (which otherwise leaves comment bookends as direct shadowRoot children,
        // crashing test helpers that walk childNodes — slot-forwarding/reactivity). The
        // `slot={expr}` dynamic case keeps its attr via a normal setProp binding.
        if (elem.slotBind !== undefined) {
            return 'slot';
        }
    }
    // Dynamic components: lwc:is/lwc:dynamic, or the <lwc:component> tag.
    if (elem.dynamicCtor || elem.tag === 'lwc:component') return 'component';
    if (elem.isComponent) return 'component';
    return null;
}

/**
 * Build the IR operation for a control-flow / component / slot node. `insertInto`
 * is set when the node is nested inside a static parent element (so it must be
 * inserted at an anchor rather than returned as a block root).
 */
/**
 * Produces the body child nodes for a control-flow element, after removing the
 * directive that `kind` consumes. A `<template>` wrapper (`<template for:each>`,
 * `<template lwc:if>`) contributes its *children* as the body. A regular element
 * (`<li for:each>`) contributes itself with the directive stripped — but if it
 * still carries another control-flow directive, that remains so it is processed
 * as nested control flow.
 */
function bodyChildrenFor(elem: ParsedElement, kind: ControlFlowKind): ParsedNode[] {
    const stripped: ParsedElement = { ...elem };
    if (kind === 'if') {
        stripped.ifCondition = undefined;
    } else if (kind === 'for') {
        stripped.forEachSource = undefined;
        stripped.forEachItem = undefined;
        stripped.forEachIndex = undefined;
        stripped.iteratorName = undefined;
        // `key` stays with the iterated element/child, not the for wrapper.
    }
    if (elem.tag === 'template') {
        // The <template> wrapper itself does not render; its children are the body.
        return elem.children;
    }
    return [{ type: 'element', data: stripped }];
}

/**
 * If `node` is a `<template lwc:if/for>` wrapper (with NO elseif/else chain and no
 * scoped-slot data) whose DIRECT element children carry MORE THAN ONE distinct
 * `slot` name, split it into one clone per slot name — each clone keeps the same
 * condition/iteration but contains only the children destined for that slot. This
 * matches engine-core, which evaluates the conditional once and then distributes
 * each resulting child into its own slot. Returns null when no split is needed.
 */
function splitMixedSlotWrapper(node: ParsedNode): ParsedNode[] | null {
    if (node.type !== 'element') return null;
    const el = node.data;
    if (el.tag !== 'template') return null;
    const isIf = Boolean(el.ifCondition);
    const isFor = Boolean(el.forEachSource);
    if (!isIf && !isFor) return null;
    // Conditionals with elseif/else chains and scoped-slot wrappers are single-slot
    // by construction here — don't split them.
    if (el.negativeChain && el.negativeChain.length) return null;
    if (el.slotData) return null;

    // Collect the distinct slot names of the wrapper's direct ELEMENT children.
    // Bail if ANY direct child is itself a control-flow / scoped `<template>` wrapper
    // (nested lwc:if/for/slot-data): such a child's content is distributed by its own
    // logic and the conditional structure must stay intact — splitting it apart breaks
    // nested-conditional slotting (directive-if-elseif-else nested-conditional-slot).
    const order: string[] = [];
    const seen = new Set<string>();
    for (const c of el.children) {
        if (c.type !== 'element') continue;
        const cd = c.data;
        if (cd.tag === 'template' && (cd.ifCondition || cd.forEachSource || cd.slotData)) {
            return null;
        }
        const s = cd.attrs.slot || '';
        if (!seen.has(s)) {
            seen.add(s);
            order.push(s);
        }
    }
    if (order.length <= 1) return null; // single slot — nothing to split

    // One clone of the wrapper per slot name, preserving document order of the
    // distinct slot names, each holding only its matching children.
    return order.map((slotName) => {
        const kids = el.children.filter(
            (c) => c.type === 'element' && (c.data.attrs.slot || '') === slotName
        );
        const clone: ParsedElement = { ...el, children: kids };
        return { type: 'element', data: clone };
    });
}

/**
 * Transform the body children of an lwc:if/elseif/else BRANCH that is used as
 * COMPONENT slot content, detecting the lone scoped-slot case: a branch whose only
 * significant child is a `<template lwc:slot-data="x">` (no nested if/for on that
 * template). engine-core resolves slot scopedness PER PRODUCED vnode, so a `""` slot
 * fn can be scoped in one conditional branch and standard in another. When detected,
 * we UNWRAP the `<template lwc:slot-data>` and transform its children into the branch
 * block, recording `scopedData` on the produced block so codegen wraps the return in a
 * runtime `scopedSlotFragment((x) => …)` marker (and treats `x` as a LOCAL). Falls back
 * to a plain `transformBlock` when the branch is not the lone-scoped-template shape.
 */
function scopedBranchBlock(children: ParsedNode[], templates: string[]): BlockIR {
    const significant = children.filter(
        (c) => !(c.type === 'text' && c.data.content.trim() === '' && !c.data.dynamic)
    );
    if (significant.length === 1) {
        const only = significant[0];
        if (
            only.type === 'element' &&
            only.data.tag === 'template' &&
            only.data.slotData !== undefined &&
            !only.data.ifCondition &&
            !only.data.forEachSource
        ) {
            const inner = only.data.children.filter(
                (c) => !(c.type === 'text' && c.data.content.trim() === '' && !c.data.dynamic)
            );
            const block = transformBlock(inner, templates, /* isSlotContent */ true);
            block.scopedData = only.data.slotData;
            return block;
        }
    }
    return transformBlock(children, templates, /* isSlotContent */ true);
}

function buildControlFlowOp(
    elem: ParsedElement,
    kind: ControlFlowKind,
    insertInto: InsertTarget | undefined,
    templates: string[],
    /** True when this control-flow is used as COMPONENT slot content (so a nested
     *  `<template lwc:slot-data>` in a branch becomes a per-branch scoped fragment). */
    slotContent = false
): OperationIR {
    const varName = freshDynVar();
    switch (kind) {
        case 'if': {
            const positive = slotContent
                ? scopedBranchBlock(bodyChildrenFor(elem, 'if'), templates)
                : transformBlock(bodyChildrenFor(elem, 'if'), templates);
            // Build the negative chain (lwc:elseif / lwc:else) as nested IF/blocks.
            let negative: BlockIR | undefined;
            const chain = elem.negativeChain;
            if (chain && chain.length) {
                // Construct from the end backwards so each elseif's negative is
                // the next branch.
                let acc: BlockIR | undefined;
                for (let i = chain.length - 1; i >= 0; i--) {
                    const branch = chain[i];
                    const branchBody = slotContent
                        ? scopedBranchBlock(branch.node.children, templates)
                        : transformBlock(branch.node.children, templates);
                    if (branch.condition === null) {
                        // lwc:else — terminal block.
                        acc = branchBody;
                    } else {
                        // lwc:elseif — an IF whose negative is the accumulated tail.
                        const elseifVar = freshDynVar();
                        const nestedIf: IfIR = {
                            type: IRNodeTypes.IF,
                            varName: elseifVar,
                            condition: branch.condition,
                            positive: branchBody,
                            negative: acc,
                        };
                        // A slot-content elseif's OWN bookends must be suppressed too
                        // (engine-core's flattenFragmentsInChildren strips a slotted
                        // conditional's delimiters — the receiving `<slot>` provides the
                        // only pair). The TOP-level slot-content `lwc:if` is marked
                        // anchorless+noBookends in transformBlock; the NESTED elseif chain
                        // built here must carry the same flags or its persistent comment
                        // anchor leaks a spurious bookend pair into the projected content
                        // (scoped-slot if-block: scoped case rendered 6 bookend pairs
                        // instead of 3).
                        if (slotContent) {
                            nestedIf.anchorless = true;
                            nestedIf.noBookends = true;
                        }
                        const ifBlock: BlockIR = {
                            type: IRNodeTypes.BLOCK,
                            templateIndex: -1,
                            nodeRefs: [],
                            operations: [nestedIf],
                            effects: [],
                            returns: [elseifVar],
                        };
                        acc = ifBlock;
                    }
                }
                negative = acc;
            }
            return {
                type: IRNodeTypes.IF,
                varName,
                condition: elem.ifCondition!,
                positive,
                negative,
                insertInto,
                legacy: elem.ifLegacy === true,
            };
        }
        case 'for': {
            const bodyChildren = bodyChildrenFor(elem, 'for');
            const body = transformBlock(bodyChildren, templates);
            // The `key` directive lives on the iterated element. For the
            // `<element for:each>` form it is on the element itself; for the
            // `<template for:each>` wrapper form it is on a body element — which may
            // be nested inside conditional wrappers (`<template lwc:if><div key=..>`),
            // so search the body subtree (descending through if/elseif/else wrappers)
            // for the first `key`. Without this the for:each falls back to INDEX keys,
            // breaking keyed reordering of conditional list items
            // (directive-if-elseif-else foreach prepend → `h240f`).
            let key = elem.forKey;
            if (!key) {
                key = findForKey(bodyChildren);
            }
            return {
                type: IRNodeTypes.FOR,
                varName,
                source: elem.forEachSource!,
                item: elem.iteratorName || elem.forEachItem || 'item',
                index: elem.forEachIndex,
                key,
                body,
                iterator: Boolean(elem.iteratorName),
                insertInto,
            };
        }
        case 'slot': {
            // A `<slot>`'s children are its fallback content (rendered when no
            // slotted content is provided for this slot name). Compile them into a
            // block; strip whitespace-only text the same way other blocks do.
            const fallbackChildren = elem.children.filter(
                (c) => !(c.type === 'text' && c.data.content.trim() === '' && !c.data.dynamic)
            );
            const fallback =
                fallbackChildren.length > 0
                    ? transformBlock(fallbackChildren, templates)
                    : undefined;
            return {
                type: IRNodeTypes.SLOT,
                varName,
                // Default (unnamed) slot uses '' to match parent slot grouping.
                name: elem.attrs.name || '',
                bind: elem.slotBind,
                // A FORWARDING slot (`<slot slot="Y">`) re-tags its resolved content
                // with `slot="Y"` for the enclosing component. Capture the static
                // value or the dynamic expression so the runtime can re-apply it.
                forwardAs: elem.attrs.slot,
                forwardAsExpr: elem.props.slot,
                fallback,
                insertInto,
            };
        }
        case 'component': {
            // Group slotted children by their `slot` attribute ('' = default).
            // A child's slot name comes from its own `slot` attr; for a
            // `<template if/for>` wrapper, the slot name is taken from the slotted
            // element(s) it contains (LWC requires a consistent slot per branch).
            const slotNameOf = (node: ParsedNode): string => {
                if (node.type !== 'element') return '';
                const el = node.data;
                // A scoped-slot `<template lwc:slot-data>` carries its target slot
                // name via its own `slot` attr (default '' otherwise).
                if (el.tag === 'template' && el.slotData) {
                    return el.attrs.slot || '';
                }
                if (el.tag === 'template' && (el.ifCondition || el.forEachSource)) {
                    for (const inner of el.children) {
                        if (inner.type === 'element' && inner.data.attrs.slot) {
                            return inner.data.attrs.slot;
                        }
                    }
                    return '';
                }
                return el.attrs.slot || '';
            };
            // A `<template lwc:if/for>` wrapper may contain children destined for
            // DIFFERENT slots (e.g. `<template lwc:if><p slot="upper">…<p>…<p slot="lower">`).
            // engine-core renders the conditional once and then distributes each resulting
            // child by its OWN slot attribute. We model that by splitting such a wrapper
            // into one clone per distinct inner slot name, each carrying the SAME condition
            // but only its matching children — so each lands in the correct slot group.
            // (Skip wrappers with an elseif/else chain or scoped-slot data — those are
            // single-slot by construction in practice and splitting them is unsafe.)
            const expandedChildren: ParsedNode[] = [];
            for (const child of elem.children) {
                const split = splitMixedSlotWrapper(child);
                if (split) expandedChildren.push(...split);
                else expandedChildren.push(child);
            }

            const slotGroups = new Map<string, ParsedNode[]>();
            // Scoped-slot data param per group: a `<template lwc:slot-data="x">`
            // wrapper makes its group a scoped slot; `x` is the data param name.
            const slotDataByName = new Map<string, string>();
            // DYNAMIC-slot children (`slot={expr}`), in document order — distributed at
            // runtime by evaluating the name expression. Kept ordered + separate so
            // static slotting (and shadow native projection) is unchanged.
            const dynamicSlots: Array<{
                nameExpr: string;
                block: BlockIR;
                scoped?: boolean;
                slotData?: string;
            }> = [];
            for (const child of expandedChildren) {
                if (
                    child.type === 'text' &&
                    child.data.content.trim() === '' &&
                    !child.data.dynamic
                ) {
                    continue; // ignore insignificant whitespace
                }
                // A child authored with `slot={expr}` (dynamic name) → runtime
                // distribution. `props.slot` holds the expression. A scoped variant is
                // `<template slot={expr} lwc:slot-data="x">`.
                if (
                    child.type === 'element' &&
                    child.data.props.slot !== undefined &&
                    child.data.tag !== 'slot'
                ) {
                    const cd = child.data;
                    const isScopedTpl = cd.tag === 'template' && cd.slotData !== undefined;
                    const contentNodes = isScopedTpl ? cd.children : [child];
                    dynamicSlots.push({
                        nameExpr: cd.props.slot,
                        block: transformBlock(contentNodes, templates, /* isSlotContent */ true),
                        scoped: isScopedTpl || undefined,
                        slotData: isScopedTpl ? cd.slotData : undefined,
                    });
                    continue;
                }
                // A FORWARDING `<slot slot={expr}>` (dynamic target, no slot-bind): its
                // CONTENT comes from THIS component's `$slotset` (a createSlot op reading
                // the slot's own `name`), but it must be DISTRIBUTED into the enclosing
                // component by the runtime-resolved `slot={expr}` name. So route it into
                // `dynamicSlots` keyed by `props.slot`, with its block being the
                // forwarding `<slot>` transformed normally (still a createSlot op). Without
                // this, a `<slot slot={expr}>` was lumped into the positional default
                // group (its dynamic name unknown at compile time) and never reached the
                // enclosing component's named slot (multi-level light-dom forwarding:
                // slot-forwarding/reactivity, forwarding assignments, lifecycle).
                if (
                    child.type === 'element' &&
                    child.data.tag === 'slot' &&
                    child.data.props.slot !== undefined &&
                    child.data.slotBind === undefined
                ) {
                    dynamicSlots.push({
                        nameExpr: child.data.props.slot,
                        block: transformBlock([child], templates, /* isSlotContent */ true),
                    });
                    continue;
                }
                const slotName = slotNameOf(child);
                if (!slotGroups.has(slotName)) slotGroups.set(slotName, []);
                // A scoped-slot `<template lwc:slot-data>` contributes its CHILDREN
                // to the group (the template wrapper itself is unwrapped) and records
                // the data param name for the group.
                if (child.type === 'element' && child.data.slotData) {
                    slotDataByName.set(slotName, child.data.slotData);
                    for (const inner of child.data.children) {
                        if (
                            inner.type === 'text' &&
                            inner.data.content.trim() === '' &&
                            !inner.data.dynamic
                        ) {
                            continue;
                        }
                        slotGroups.get(slotName)!.push(inner);
                    }
                } else {
                    slotGroups.get(slotName)!.push(child);
                }
            }
            const slots = [...slotGroups.entries()].map(([name, nodes]) => ({
                name,
                block: transformBlock(nodes, templates, /* isSlotContent */ true),
                slotData: slotDataByName.get(name),
            }));
            // Static attributes on a component are passed as string-valued props
            // (e.g. <x-leaf name="before-container">). `slot` is consumed by slot
            // distribution and must not be forwarded as a prop.
            const staticProps = Object.entries(elem.attrs)
                .filter(([key]) => key !== 'slot')
                .map(([key, value]) => ({
                    key,
                    value,
                    // Forward as boolean `true` ONLY for a genuine boolean attribute
                    // (`hidden`) authored bare (`<x-child hidden>`) or with an empty
                    // value (`hidden=""`) — both mean "present". Setting `host.hidden`
                    // to the empty string would coerce the reflective boolean property
                    // to false (attribute-boolean-global). Restricted to
                    // `isBooleanAttribute` so explicit-boolean reflected attrs like
                    // `spellcheck`/`draggable` (which reflect the STRING "true"/"false",
                    // not a boolean) keep their string value (spellcheck-attribute).
                    bool:
                        isBooleanAttribute(key, elem.tag) &&
                        (elem.boolAttrs?.has(key) || value === ''),
                }));
            const props = Object.entries(elem.props).map(([key, expression]) => ({
                key,
                expression,
            }));
            // `class={expr}` / `style={expr}` on a component are dynamic attribute
            // bindings on the host (parsed into classBinding/styleBinding), not in
            // `elem.props`. Forward them as `class`/`style` prop bindings so the
            // host element reflects them (and the child can read getAttribute).
            if (elem.classBinding) {
                props.push({ key: 'class', expression: elem.classBinding });
            }
            if (elem.styleBinding) {
                props.push({ key: 'style', expression: elem.styleBinding });
            }
            // Event listeners declared on the component host (`<x-child
            // onclick={fn}>`) are wired with `on(host, type, handler)` at runtime —
            // additive with any `lwc:spread={{ onclick }}`.
            const events = Object.entries(elem.events).map(([event, handler]) => ({
                event,
                handler,
            }));
            return {
                type: IRNodeTypes.COMPONENT,
                varName,
                tag: elem.tag,
                props,
                staticProps,
                dynamicCtor: elem.dynamicCtor,
                spread: elem.spread,
                lwcOn: elem.lwcOn,
                ref: elem.ref,
                events: events.length ? events : undefined,
                slots: slots.length ? slots : undefined,
                dynamicSlots: dynamicSlots.length ? dynamicSlots : undefined,
                insertInto,
            };
        }
    }
}

function getOpVarName(op: OperationIR): string {
    return (op as { varName: string }).varName;
}

/**
 * Build the static HTML for an element and register dynamic operations on it
 * and its descendants. Returns the HTML string for this element.
 */
function buildElementHtml(
    elem: ParsedElement,
    thisRef: string,
    nodeRefs: NodeRef[],
    operations: OperationIR[],
    effects: EffectIR[],
    templatesRef: string[],
    inSvg = false
): string {
    // Are we inside an <svg> subtree? `<svg>` opens the SVG namespace; descendants
    // inherit it. This gates the legacy `sanitizeAttribute` hook on `<use href>` /
    // `<use xlink:href>` (only meaningful in the SVG namespace — see isSvgUseHref).
    const childInSvg = inSvg || elem.tag === 'svg';
    // Static attributes. `class` and `style` are whitespace-normalized to match
    // the standard LWC compiler (collapse runs, trim, canonical `prop: val;` form).
    // `value`/`checked` on form elements are treated as PROPERTIES rather than
    // attributes (the attributes only set the *default* value), matching LWC — so
    // they are emitted as one-time property sets, not into the static HTML.
    const usesFormProp = INPUT_PROP_ELEMENTS.has(elem.tag);
    // `<iframe>` is NEVER static-content-optimized (matching the standard
    // compiler): baking `src` into the innerHTML string would make the browser
    // pre-fetch the URL during template parse. Emit attrs as runtime SET_ATTR ops
    // so `setAttribute('src', ...)` runs once on the real element instead.
    const isIframe = elem.tag === 'iframe';
    const staticAttrs: string[] = [];
    for (const [key, value] of Object.entries(elem.attrs)) {
        // `<use href>` / `<use xlink:href>` inside <svg>: route the STATIC value
        // through the legacy `sanitizeAttribute` hook at runtime (Locker patches it
        // to sanitize vulnerable SVG-use URLs). Matches the standard compiler's
        // `isSvgUseHref` + `addLegacySanitizationHook` codegen. Emit a SET_ATTR effect
        // wrapping the literal in `sanitizeAttribute(tag, ns, attr, value)` instead of
        // baking it into the static HTML string.
        // A BARE boolean `<use href>` (no `=`) is an empty boolean attribute — there
        // is nothing to sanitize (no URL), so the standard compiler does NOT wrap it
        // in `sanitizeAttribute` (the boolean-literal path bypasses isSvgUseHref).
        // Only sanitize when there's an actual string value.
        if (isSvgUseHref(elem.tag, key, childInSvg) && elem.boolAttrs?.has(key) !== true) {
            usesSanitizeAttribute = true;
            effects.push({
                operations: [
                    {
                        type: IRNodeTypes.SET_ATTR,
                        ref: thisRef,
                        attr: key,
                        expression: `sanitizeAttribute(${JSON.stringify(elem.tag)}, ${JSON.stringify(SVG_NAMESPACE)}, ${JSON.stringify(key)}, ${JSON.stringify(value)})`,
                    },
                ],
            });
            continue;
        }
        if (isIframe) {
            effects.push({
                operations: [
                    {
                        type: IRNodeTypes.SET_ATTR,
                        ref: thisRef,
                        attr: key,
                        expression: JSON.stringify(value),
                    },
                ],
            });
            continue;
        }
        if (usesFormProp && (key === 'value' || key === 'checked')) {
            // Static form-prop attrs are set as PROPERTIES. `checked` is BOOLEAN:
            // any empty form (`checked` / `checked=""`) → `true`. `value` is NOT
            // boolean: only a BARE `<input value>` (no `=`) → `true` (engine-core
            // sets `input.value = true` → "true"); an explicit `value=""` stays "".
            // `boolAttrs` records bare (no-`=`) attributes.
            const isBare = elem.boolAttrs?.has(key) === true;
            const propVal =
                (key === 'checked' && value === '') || (key === 'value' && isBare && value === '')
                    ? 'true'
                    : JSON.stringify(value);
            effects.push({
                operations: [
                    { type: IRNodeTypes.SET_PROP, ref: thisRef, prop: key, expression: propVal },
                ],
            });
            continue;
        }
        // On an `lwc:external` element, `inner-h-t-m-l`/`outer-h-t-m-l` is a property
        // attempt that engine-dom rejects with a dev warning (rendering/inner-outer-html);
        // route through SET_PROP (the runtime warns + skips). Plain native elements
        // (e.g. <div>) instead keep it as a harmless attribute and do NOT warn.
        const externalHtmlProp = elem.isExternal ? attrToInnerOuterHtmlProp(key) : null;
        if (externalHtmlProp) {
            effects.push({
                operations: [
                    {
                        type: IRNodeTypes.SET_PROP,
                        ref: thisRef,
                        prop: externalHtmlProp,
                        expression: JSON.stringify(value),
                    },
                ],
            });
            continue;
        }
        // On an `lwc:external` element, a STATIC attribute must go through the same
        // runtime prop-vs-attribute heuristic as dynamic ones (`prop="static"` →
        // `el.prop = 'static'` when `prop` is a property of the upgraded element).
        // Baking it into the static HTML would leave it a plain attribute, so
        // `externalEl.prop` would read the element's default. `class`/`style`/`slot`
        // keep their normal attribute handling (engine-core treats them as attrs).
        if (elem.isExternal && key !== 'class' && key !== 'style' && key !== 'slot') {
            effects.push({
                operations: [
                    {
                        type: IRNodeTypes.SET_PROP,
                        ref: thisRef,
                        prop: key,
                        expression: JSON.stringify(value),
                        external: true,
                    },
                ],
            });
            continue;
        }
        let v = value;
        if (key === 'class') {
            v = normalizeClassAttr(value);
            // An empty/whitespace-only `class` produces NO attribute (engine-core
            // omits it), not a bare boolean `class`.
            if (v === '') continue;
        } else if (key === 'style') {
            v = normalizeStyleAttr(value);
            // An empty/whitespace/invalid `style` produces NO attribute (engine-core
            // omits it), rather than a bare boolean `style` attribute.
            if (v === '') continue;
        }
        staticAttrs.push(v === '' ? key : `${key}="${escapeHtml(v)}"`);
    }
    const attrStr = staticAttrs.length ? ' ' + staticAttrs.join(' ') : '';

    // Dynamic prop bindings → effects. On an external element, `inner-h-t-m-l`/
    // `outer-h-t-m-l` map to the innerHTML/outerHTML property (rejected at runtime).
    for (const [key, expression] of Object.entries(elem.props)) {
        // Dynamic `<use href={x}>` / `<use xlink:href={x}>` inside <svg>: set as an
        // ATTRIBUTE whose value is run through the legacy `sanitizeAttribute` hook,
        // matching the standard compiler (isSvgUseHref + addLegacySanitizationHook).
        if (isSvgUseHref(elem.tag, key, childInSvg)) {
            usesSanitizeAttribute = true;
            effects.push({
                operations: [
                    {
                        type: IRNodeTypes.SET_ATTR,
                        ref: thisRef,
                        attr: key,
                        expression: `sanitizeAttribute(${JSON.stringify(elem.tag)}, ${JSON.stringify(SVG_NAMESPACE)}, ${JSON.stringify(key)}, ${expression})`,
                    },
                ],
            });
            continue;
        }
        const externalHtmlProp = elem.isExternal ? attrToInnerOuterHtmlProp(key) : null;
        effects.push({
            operations: [
                {
                    type: IRNodeTypes.SET_PROP,
                    ref: thisRef,
                    prop: externalHtmlProp ?? key,
                    expression,
                    // On an `lwc:external` element, a bound attribute is set as a
                    // PROPERTY iff its camelCased name exists on the element, else as
                    // an attribute (engine-core attrs.ts heuristic). The inner/outer
                    // HTML props are already mapped above and handled by setProp.
                    external: elem.isExternal && !externalHtmlProp ? true : undefined,
                },
            ],
        });
    }
    if (elem.classBinding) {
        effects.push({
            operations: [
                { type: IRNodeTypes.SET_CLASS, ref: thisRef, expression: elem.classBinding },
            ],
        });
    }
    if (elem.styleBinding) {
        effects.push({
            operations: [
                { type: IRNodeTypes.SET_STYLE, ref: thisRef, expression: elem.styleBinding },
            ],
        });
    }
    // lwc:inner-html={expr} — reactively set innerHTML. SKIPPED when the element ALSO
    // has lwc:spread: engine-core merges spread LAST into the props object, so a spread
    // `innerHTML` overrides the directive's, and the runtime then rejects `innerHTML`
    // from spread (warn) → the element ends up EMPTY regardless of the directive value
    // (spread "should not override innerHTML from inner-html directive"). Emitting the
    // directive's SET_HTML would wrongly leave the directive's content. (The element's
    // static children are already stripped at compile time for an lwc:inner-html /
    // lwc:dom="manual" element, so skipping leaves it empty — matching engine-core.)
    if (elem.innerHTML && !elem.spread) {
        effects.push({
            operations: [{ type: IRNodeTypes.SET_HTML, ref: thisRef, expression: elem.innerHTML }],
        });
    }
    // lwc:spread={obj} — reactively apply an object's props.
    if (elem.spread) {
        effects.push({
            operations: [
                {
                    type: IRNodeTypes.SET_DYNAMIC_PROPS,
                    ref: thisRef,
                    expression: elem.spread,
                    external: elem.isExternal ? true : undefined,
                },
            ],
        });
    }
    // lwc:on={obj} — bind each property of the object as an event listener.
    if (elem.lwcOn) {
        effects.push({
            operations: [{ type: IRNodeTypes.LWC_ON, ref: thisRef, expression: elem.lwcOn }],
        });
    }
    for (const [event, handler] of Object.entries(elem.events)) {
        operations.push({
            type: IRNodeTypes.SET_EVENT,
            ref: thisRef,
            event,
            handler,
            delegated: DELEGATABLE_EVENTS.has(event),
        });
    }
    if (elem.ref) {
        operations.push({ type: IRNodeTypes.REF, ref: thisRef, name: elem.ref });
    }

    // lwc:dom="manual" / lwc:inner-html elements own their children at runtime;
    // do not compile authored children into the static template.
    if (elem.domManual || elem.innerHTML) {
        if (isVoidElement(elem.tag)) return `<${elem.tag}${attrStr}>`;
        return `<${elem.tag}${attrStr}></${elem.tag}>`;
    }

    // Children: recurse for dynamic text and nested dynamic elements. Fold
    // lwc:else/lwc:elseif into the preceding lwc:if FIRST (same as transformBlock
    // does at the root) — otherwise an if/else chain nested inside a non-root
    // element renders the else branch as a literal static <template> and never
    // wires its negative branch (directive-if-elseif-else nested case).
    let childHtml = '';
    let childIndex = 0;
    for (const childNode of foldElseChains(elem.children)) {
        if (childNode.type === 'text') {
            if (childNode.data.dynamic) {
                childHtml += ' ';
                const ref = freshElemVar();
                nodeRefs.push({
                    varName: ref,
                    path: [...refPath(thisRef, nodeRefs), { kind: 'nthChild', index: childIndex }],
                });
                effects.push({
                    operations: [
                        {
                            type: IRNodeTypes.SET_TEXT,
                            ref,
                            expression: childNode.data.expression!,
                        },
                    ],
                });
                childIndex++;
            } else {
                childHtml += childNode.data.content;
                childIndex++;
            }
        } else if (childNode.type === 'comment') {
            // Preserved HTML comment (`lwc:preserve-comments`).
            childHtml += `<!--${childNode.data.content}-->`;
            childIndex++;
        } else {
            const childElem = childNode.data;
            const cf = controlFlowKind(childElem);
            if (cf) {
                // Hoist nested control-flow: emit a comment anchor in the static
                // HTML and insert the dynamic block at that anchor at runtime.
                childHtml += '<!---->';
                const anchorRef = freshElemVar();
                nodeRefs.push({
                    varName: anchorRef,
                    path: [...refPath(thisRef, nodeRefs), { kind: 'nthChild', index: childIndex }],
                });
                const insertInto: InsertTarget = { parentRef: thisRef, anchorRef };
                operations.push(buildControlFlowOp(childElem, cf, insertInto, templatesRef));
                childIndex++;
            } else {
                const childRef = freshElemVar();
                nodeRefs.push({
                    varName: childRef,
                    path: [...refPath(thisRef, nodeRefs), { kind: 'nthChild', index: childIndex }],
                });
                childHtml += buildElementHtml(
                    childElem,
                    childRef,
                    nodeRefs,
                    operations,
                    effects,
                    templatesRef,
                    childInSvg
                );
                childIndex++;
            }
        }
    }

    if (isVoidElement(elem.tag)) {
        return `<${elem.tag}${attrStr}>`;
    }
    return `<${elem.tag}${attrStr}>${childHtml}</${elem.tag}>`;
}

/** Look up the traversal path for a previously-registered ref. */
function refPath(varName: string, nodeRefs: NodeRef[]): Accessor[] {
    const found = nodeRefs.find((r) => r.varName === varName);
    return found ? found.path : [];
}

/**
 * If `attr` is the kebab-cased form of `innerHTML`/`outerHTML` (`inner-h-t-m-l` /
 * `outer-h-t-m-l`, the way the template compiler kebab-cases those property names),
 * return the camelCase property name; otherwise null. Used to route these to a
 * runtime property-set that engine-dom rejects with a dev warning.
 */
function attrToInnerOuterHtmlProp(attr: string): string | null {
    if (attr === 'inner-h-t-m-l') return 'innerHTML';
    if (attr === 'outer-h-t-m-l') return 'outerHTML';
    return null;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Collapse whitespace runs and trim, matching class-attribute normalization. */
function normalizeClassAttr(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
}

/**
 * Normalize a static `style` attribute to the canonical `prop: value;` form the
 * standard LWC compiler emits: each declaration is `name: value`, whitespace
 * runs collapse, an `! important` flag becomes ` !important`, and every
 * declaration ends with a semicolon.
 */
function normalizeStyleAttr(value: string): string {
    const out: string[] = [];
    for (const rawDecl of value.split(';')) {
        const decl = rawDecl.trim();
        if (decl === '') continue;
        const colon = decl.indexOf(':');
        if (colon === -1) {
            // A declaration without a colon is invalid CSS — engine-core's
            // parseStyleText drops it (so `style="invalid"` → no style attribute).
            continue;
        }
        const prop = decl.slice(0, colon).trim().replace(/\s+/g, ' ');
        let val = decl
            .slice(colon + 1)
            .trim()
            .replace(/\s+/g, ' ');
        // Canonicalize the `!important` flag: `! important`, `!IMPORTANT`, etc.
        val = val.replace(/!\s*important\s*$/i, '!important');
        out.push(`${prop}: ${val}`);
    }
    return out.map((d) => `${d};`).join(' ');
}
