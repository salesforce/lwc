/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LWC_VERSION_COMMENT } from '@lwc/shared';
import {
    IRNodeTypes,
    type RootIR,
    type BlockIR,
    type OperationIR,
    type EffectIR,
    type Accessor,
    type ForIR,
    type IfIR,
} from '../ir';
import type { VaporCompileOptions } from '../compile';

const RUNTIME_MODULE = '@lwc/engine-vapor';

/**
 * The basename used for co-located stylesheet imports: the TEMPLATE file's own
 * name (so `a.html` → `a.css`), derived from `options.filename`. Falls back to the
 * component `name`. Returns undefined when neither is available (no style imports).
 */
function cssBasename(options: VaporCompileOptions): string | undefined {
    const f = options.filename;
    if (f) {
        const base = f.slice(Math.max(f.lastIndexOf('/'), f.lastIndexOf('\\')) + 1);
        const dot = base.lastIndexOf('.');
        return dot > 0 ? base.slice(0, dot) : base;
    }
    return options.name;
}

interface CodegenContext {
    imports: Set<string>;
    code: string[];
    indent: number;
    options: VaporCompileOptions;
    /** Identifiers that are local (for:item / for:index), not component members. */
    locals: Set<string>;
    /** Local identifiers that are reactive refs; reads get `.value` appended. */
    refLocals: Set<string>;
    /** Child component imports: tag -> { specifier, localName }. */
    componentImports: Map<string, { specifier: string; local: string }>;
    /** Set when the template declares any `lwc:ref` (incl. on dynamic components). */
    hasRefs?: { value: boolean };
    /** Monotonic id for per-instance event-handler memoization (engine-core $ctx._mN). */
    eventMemoId?: { value: number };
}

/**
 * Converts a custom-element tag to its LWC module specifier and a local import
 * identifier. e.g. `x-foo-bar` -> { specifier: 'x/fooBar', local: '_cmpFooBar' }.
 */
function tagToImport(tag: string): { specifier: string; local: string } {
    const [ns, ...rest] = tag.split('-');
    const name = rest.join('-').replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
    const pascal = name.charAt(0).toUpperCase() + name.slice(1);
    return { specifier: `${ns}/${name}`, local: `_cmp${pascal}` };
}

const IDENTIFIER_RE = /[A-Za-z_$][\w$]*/g;
// Reserved words / globals that must never be prefixed with `$cmp.`.
const RESERVED = new Set([
    'true',
    'false',
    'null',
    'undefined',
    'this',
    'NaN',
    'Infinity',
    'typeof',
    'instanceof',
    'new',
    'void',
    'in',
    'of',
    'function',
    'return',
    // Imported at module scope (SVG `<use href>` legacy hook) — a free identifier
    // that must NOT be rewritten to `$cmp.sanitizeAttribute`. Its inner value arg
    // is a SEPARATE identifier that still gets prefixed normally.
    'sanitizeAttribute',
]);

/**
 * Rewrites a template expression so that free identifiers referring to component
 * members are prefixed with `$cmp.`, while local bindings (for:item, for:index)
 * and reserved words are left untouched. Only the *root* identifier of a member
 * expression is prefixed (e.g. `item.id` → `item.id` when `item` is local;
 * `user.name` → `$cmp.user.name` otherwise). Property keys after a `.` are not
 * treated as identifiers to prefix.
 */
/** Booleans marking which character positions of `expr` are inside a string literal. */
function computeStringMask(expr: string): boolean[] {
    const mask = new Array<boolean>(expr.length).fill(false);
    let quote: string | null = null;
    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (quote) {
            mask[i] = true;
            if (ch === '\\') {
                if (i + 1 < expr.length) mask[i + 1] = true;
                i++;
                continue;
            }
            if (ch === quote) quote = null;
        } else if (ch === '"' || ch === "'" || ch === '`') {
            quote = ch;
            mask[i] = true;
        }
    }
    return mask;
}

function prefixExpression(expr: string, locals: Set<string>, refLocals?: Set<string>): string {
    // Mask positions that fall inside string literals so identifiers within
    // string content (e.g. "Dynamic: ") are never treated as member references.
    const inString = computeStringMask(expr);

    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    IDENTIFIER_RE.lastIndex = 0;
    while ((match = IDENTIFIER_RE.exec(expr)) !== null) {
        const name = match[0];
        const start = match.index;
        if (inString[start]) {
            continue; // identifier inside a string literal — leave untouched
        }
        // Determine the character just before this identifier (skipping spaces).
        let p = start - 1;
        while (p >= 0 && /\s/.test(expr[p])) p--;
        const prevChar = p >= 0 ? expr[p] : '';
        // Skip property accesses (`.foo`) and object keys (`foo:`).
        const isMemberProp = prevChar === '.';
        // Determine following non-space char.
        let n = start + name.length;
        while (n < expr.length && /\s/.test(expr[n])) n++;
        const nextChar = n < expr.length ? expr[n] : '';
        const isObjectKey = nextChar === ':';
        const isCalleeOnly = false;

        result += expr.slice(lastIndex, start);
        if (isMemberProp || isObjectKey || isCalleeOnly || RESERVED.has(name) || /^\d/.test(name)) {
            result += name;
        } else if (refLocals && refLocals.has(name)) {
            // Reactive ref local (e.g. for:index): read `.value` so the read is
            // tracked and updates when the ref changes (keyed reorder).
            result += `${name}.value`;
        } else if (locals.has(name)) {
            result += name;
        } else {
            result += `$cmp.${name}`;
        }
        lastIndex = start + name.length;
    }
    result += expr.slice(lastIndex);
    return result;
}

export function generate(
    ir: RootIR,
    options: VaporCompileOptions & { scopeToken?: string; legacyScopeToken?: string }
): string {
    const ctx: CodegenContext = {
        imports: new Set(),
        code: [],
        indent: 0,
        options,
        locals: new Set(),
        refLocals: new Set(),
        componentImports: new Map(),
        hasRefs: { value: false },
    };

    // Hoisted template factories. Emit for any non-empty template string,
    // including a single-space placeholder (which materializes a text node for a
    // dynamic-text-only block). Only truly empty ('') templates are skipped.
    ctx.imports.add('template');
    for (let i = 0; i < ir.templates.length; i++) {
        const tmpl = ir.templates[i];
        if (tmpl !== '') {
            push(ctx, `const t${i} = template(${JSON.stringify(tmpl)});`);
        }
    }
    push(ctx, '');

    // Register delegated events once at module scope
    const delegated = collectDelegatedEvents(ir.block);
    if (delegated.size > 0) {
        ctx.imports.add('delegateEvents');
        push(ctx, `delegateEvents(${[...delegated].map((e) => JSON.stringify(e)).join(', ')});`);
        push(ctx, '');
    }

    push(ctx, 'export default function render($cmp, $slotset) {');
    ctx.indent++;
    generateBlock(ctx, ir.block);
    // Stamp the compiler version inside the render body (trailing comment before
    // the closing brace), matching the standard template compiler. The runtime's
    // version-mismatch check + the integration tests read this via the regex
    // /\/\*LWC compiler v([\d.]+)\*\/\s*}/.
    push(ctx, `/*${LWC_VERSION_COMMENT}*/`);
    ctx.indent--;
    push(ctx, '}');

    // Attach the component's stylesheets (compiled from its co-located .css) to
    // the render function, so the runtime can inject them into the render root on
    // mount. The `?vapor-css` query lets the rollup plugin resolve/compile the
    // co-located stylesheet without colliding with the standard `.css` resolution.
    if (options.name) {
        push(ctx, '');
        // Combine the implicit (regular) and scoped stylesheets, matching the
        // standard template compiler which imports both `./name.css` and
        // `./name.scoped.css?scoped=true`.
        push(
            ctx,
            `render.stylesheets = [...(_implicitStylesheets || []), ...(_scopedStylesheets || [])];`
        );
        const token = (options as { scopeToken?: string }).scopeToken;
        if (token) {
            push(ctx, `render.stylesheetToken = ${JSON.stringify(token)};`);
        }
        // The legacy-format scope token, applied IN ADDITION to the modern token at
        // runtime when `ENABLE_LEGACY_SCOPE_TOKENS` is set (rendering/legacy-scope-tokens).
        const legacyToken = (options as { legacyScopeToken?: string }).legacyScopeToken;
        if (legacyToken) {
            push(ctx, `render.legacyStylesheetToken = ${JSON.stringify(legacyToken)};`);
        }
    }

    // Flag templates that declare any `lwc:ref` so the runtime exposes `this.refs`
    // as an object (vs undefined when no refs are declared at all).
    if (ctx.imports.has('applyRefs') || ctx.hasRefs?.value) {
        push(ctx, `render.hasRefs = true;`);
    }

    // The template's authored render mode (`lwc:render-mode`), so the runtime can
    // detect a mismatch with the component's `static renderMode` (engine-core emits
    // `tmpl.renderMode`). Default is shadow; only emit for an explicit light template.
    if (ir.renderMode === 'light') {
        push(ctx, `render.renderMode = 'light';`);
    }

    // Match the standard compiler: every template module ends with
    // `freezeTemplate(tmpl)`, which installs the legacy `stylesheetTokens` shim and
    // (in legacy mode) mutation tracking. Emitted after the stylesheet/token
    // assignments above so those initial writes aren't reported as mutations.
    ctx.imports.add('freezeTemplate');
    push(ctx, 'freezeTemplate(render);');

    const importNames = [...ctx.imports].sort();
    const importLine = `import { ${importNames.join(', ')} } from '${RUNTIME_MODULE}';`;

    // `sanitizeAttribute` (SVG `<use href>` legacy hook) is imported from the bare
    // `lwc` specifier — NOT the vapor runtime module — because Locker/tests patch
    // the `lwc`-exported function (matching the standard compiler's codegen, whose
    // emitted templates `import { sanitizeAttribute } from 'lwc'`).
    const sanitizeImportLine = ir.usesSanitizeAttribute
        ? [`import { sanitizeAttribute } from 'lwc';`]
        : [];

    // Child component imports (default import per referenced custom element).
    const componentImportLines = [...ctx.componentImports.values()].map(
        ({ specifier, local }) => `import ${local} from '${specifier}';`
    );

    // Co-located stylesheet imports (optional; resolve to [] when absent): the
    // implicit regular stylesheet and the scoped stylesheet. Use the TEMPLATE
    // file's basename (not the component name) so a multi-template component's
    // `a.html` imports `./a.css`, not `./<component>.css` (which is shared/wrong —
    // it resolved to empty, dropping the per-template implicit stylesheet). Matches
    // the standard compiler's `path.basename(filename)`.
    const cssBase = cssBasename(options);
    const styleImportLines = cssBase
        ? [
              `import _implicitStylesheets from './${cssBase}.css';`,
              `import _scopedStylesheets from './${cssBase}.scoped.css?scoped=true';`,
          ]
        : [];

    return [
        importLine,
        ...sanitizeImportLine,
        ...componentImportLines,
        ...styleImportLines,
        '',
        ...ctx.code,
    ].join('\n');
}

function generateBlock(ctx: CodegenContext, block: BlockIR): void {
    // SCOPED-SLOT BRANCH (a `<template lwc:slot-data="x">` nested in an lwc:if/elseif
    // branch used as slot content): wrap this block's body in a runtime
    // `scopedSlotFragment((x) => { <body> })` so the produced content is tagged scoped
    // PER BRANCH, and register `x` as a LOCAL for the body so `x.id` is not `$cmp.`-
    // prefixed. Emitted into a sub-buffer so only THIS block's lines get wrapped.
    if (block.scopedData) {
        const dataParam = block.scopedData;
        ctx.imports.add('scopedSlotFragment');
        const lines: string[] = [];
        // Own locals set (don't leak the data param into sibling branches). Recurse
        // WITHOUT scopedData to emit the plain body into the sub-buffer.
        const sub: CodegenContext = {
            ...ctx,
            code: lines,
            indent: 0,
            locals: new Set(ctx.locals),
        };
        sub.locals.add(dataParam);
        generateBlock(sub, { ...block, scopedData: undefined });
        push(ctx, `return scopedSlotFragment((${dataParam}) => {`);
        ctx.indent++;
        for (const l of lines) push(ctx, l);
        ctx.indent--;
        push(ctx, `});`);
        return;
    }
    const rootVar = block.rootVar ?? block.returns[0] ?? 'n0';

    // 1. Instantiate the static template root. Multi-root blocks clone a
    //    fragment (template(html, true)); single-root blocks clone the node.
    if (block.templateIndex >= 0) {
        push(ctx, `const ${rootVar} = t${block.templateIndex}(${block.multiRoot ? 'true' : ''});`);
    }

    // 2. Generate the body (static ops, control-flow inserts, effects, return) into a
    //    BUFFER first, so step 6 can materialize ONLY the node refs the body actually
    //    uses. `nthChild(node, i)` compiles to a side-effect-free `node.childNodes[i]`
    //    read, and every ref's traversal is ROOT-ANCHORED (buildTraversal always walks
    //    from rootVar; refs never reference each other at runtime — see refPath). So a
    //    ref whose variable never appears in the emitted body is DEAD: declaring it just
    //    runs a wasted live-NodeList index read on every mount (at 10k for:each rows the
    //    compiler was emitting ~11 such dead walks per row). Dropping a var that appears
    //    NOWHERE in the body cannot change runtime behavior; a false keep (a var that
    //    only shows up inside a string literal) is merely a missed optimization, never a
    //    correctness bug — so this prune is conservatively safe for every template.
    const bodyCtx: CodegenContext = { ...ctx, code: [] };

    // 3. Static operations (events, refs, control-flow construction).
    for (const op of block.operations) {
        generateOperation(bodyCtx, op);
    }

    // 3b. Deferred ANCHORLESS for:each / lwc:if inserts — emitted AFTER all control-
    //     flow blocks are created so a block's next-sibling reference (which may point
    //     at a block declared later in document order) is in scope. Emitted in REVERSE
    //     document order so each block's next sibling is ALREADY placed when it inserts
    //     (an anchorless block resolves its position from its next sibling's live first
    //     node; if that sibling isn't placed yet the position chains/append-wrong).
    const anchorlessInserts = block.operations.filter(
        (op) =>
            (op.type === IRNodeTypes.FOR || op.type === IRNodeTypes.IF) &&
            (op as { anchorless?: boolean }).anchorless &&
            op.insertInto
    );
    for (let k = anchorlessInserts.length - 1; k >= 0; k--) {
        const op = anchorlessInserts[k] as ForIR | IfIR;
        bodyCtx.imports.add('insert');
        bodyCtx.imports.add('firstNode');
        push(
            bodyCtx,
            `insert(${op.varName}, ${op.insertInto!.parentRef}, ${op.nextSiblingRef ?? 'null'});`
        );
    }

    // 4. Reactive effects.
    for (const effect of block.effects) {
        generateEffect(bodyCtx, effect);
    }

    // 5. Return rendered roots.
    // For a multi-root block the cloned fragment is the root. Returning the
    // fragment itself is unsafe for teardown: once inserted, a DocumentFragment
    // is emptied, so a later removeBlock would find no children and leak the
    // nodes (e.g. an `if` branch toggled off would leave its static nodes behind).
    // Capture the fragment's live top-level nodes into an array AFTER nested
    // control-flow/components have been inserted into it but BEFORE it is moved
    // into the real parent, so removeBlock can remove each node individually.
    if (block.multiRoot && block.templateIndex >= 0) {
        push(bodyCtx, `return Array.from(${rootVar}.childNodes);`);
    } else if (block.returns.length === 0) {
        push(bodyCtx, 'return [];');
    } else if (block.returns.length === 1) {
        push(bodyCtx, `return ${block.returns[0]};`);
    } else {
        push(bodyCtx, `return [${block.returns.join(', ')}];`);
    }

    // 6. Materialize ONLY the node refs the body references, then flush the buffer.
    //    (Refs are declared before the body that uses them — order preserved. The
    //    buffer lines are already indented, so append them raw.)
    const bodyText = bodyCtx.code.join('\n');
    for (const ref of block.nodeRefs) {
        if (ref.varName === rootVar) continue;
        if (!isVarReferenced(ref.varName, bodyText)) continue;
        push(ctx, `const ${ref.varName} = ${buildTraversal(ctx, rootVar, ref.path)};`);
    }
    for (const line of bodyCtx.code) {
        ctx.code.push(line);
    }
}

/**
 * True if `varName` (a compiler-generated `n<digits>` / `d<digits>` node-ref variable)
 * appears as a standalone identifier token anywhere in `text`. Boundaries exclude
 * word chars and `$` so `n1` does not match inside `n10` or `$n1`.
 */
function isVarReferenced(varName: string, text: string): boolean {
    return new RegExp(`(?<![\\w$])${varName}(?![\\w$])`).test(text);
}

function buildTraversal(ctx: CodegenContext, rootVar: string, path: Accessor[]): string {
    let expr = rootVar;
    for (const accessor of path) {
        switch (accessor.kind) {
            case 'child':
                ctx.imports.add('child');
                expr = `child(${expr})`;
                break;
            case 'next':
                ctx.imports.add('next');
                expr = `next(${expr})`;
                break;
            case 'nthChild':
                ctx.imports.add('nthChild');
                expr = `nthChild(${expr}, ${accessor.index})`;
                break;
        }
    }
    return expr;
}

function generateOperation(ctx: CodegenContext, op: OperationIR): void {
    switch (op.type) {
        case IRNodeTypes.SET_EVENT: {
            const handler = prefixExpression(op.handler, ctx.locals, ctx.refLocals);
            // Route every handler through `invokeHandler($cmp, fn, e)` so a Locker
            // `callHook` (when installed) wraps the invocation — matching
            // engine-core's invokeEventListener. Without Locker it's just `fn(e)`.
            ctx.imports.add('invokeHandler');
            // MEMOIZE a NON-local handler (one resolved on `$cmp`, not a for:each
            // local): engine-core binds `onclick={a.b}` ONCE per instance ($ctx._mN)
            // so reassigning `a` later doesn't change which handler fires
            // (events/memoization). A for:each-scoped handler (`onclick={item.fn}`)
            // is NOT memoized — it rebinds each render. Detect locality by whether
            // the prefixed expression reads off `$cmp.`.
            let handlerExpr = handler;
            if (handler.startsWith('$cmp.')) {
                ctx.imports.add('memoEvent');
                if (!ctx.eventMemoId) ctx.eventMemoId = { value: 0 };
                const memoId = ctx.eventMemoId.value++;
                // Resolve + memoize the handler at BIND time (when this SET_EVENT op
                // runs as the element is created — engine-core's render/bind time),
                // NOT lazily at fire time. A NON-local handler (`onclick={a.b}`) is
                // captured ONCE per instance ($ctx._mN): reassigning `a` afterwards
                // must NOT change which handler fires (events/memoization "does not
                // redefine"). Evaluating inside the fire closure re-read `a.b` at
                // click time, picking up the reassigned value (wrong). A bind-time
                // local binds the memoized value into the listener. A for:each-local
                // handler (`onclick={item.fn}`) is NOT `$cmp.`-prefixed, so it stays
                // on the rebind-each-render path below.
                const memoVar = `_h${memoId}`;
                push(ctx, `const ${memoVar} = memoEvent($cmp, ${memoId}, () => ${handler});`);
                handlerExpr = memoVar;
            }
            const invoke = `e => invokeHandler($cmp, ${handlerExpr}, e)`;
            if (op.delegated) {
                ctx.imports.add('delegate');
                push(ctx, `delegate(${op.ref}, ${JSON.stringify(op.event)}, ${invoke});`);
            } else {
                ctx.imports.add('on');
                push(ctx, `on(${op.ref}, ${JSON.stringify(op.event)}, ${invoke});`);
            }
            break;
        }
        case IRNodeTypes.REF: {
            ctx.imports.add('applyRefs');
            push(ctx, `applyRefs(${op.ref}, ${JSON.stringify(op.name)});`);
            break;
        }
        case IRNodeTypes.IF: {
            ctx.imports.add('createIf');
            push(ctx, `const ${op.varName} = createIf(`);
            ctx.indent++;
            push(ctx, `() => ${prefixExpression(op.condition, ctx.locals, ctx.refLocals)},`);
            push(ctx, `() => {`);
            ctx.indent++;
            generateBlock(ctx, op.positive);
            ctx.indent--;
            const anchorlessIf = op.anchorless === true;
            if (op.negative) {
                push(ctx, `},`);
                push(ctx, `() => {`);
                ctx.indent++;
                generateBlock(ctx, op.negative);
                ctx.indent--;
                push(ctx, anchorlessIf ? `},` : `}`);
            } else {
                push(ctx, anchorlessIf ? `},` : `}`);
                // No negative branch but anchorless → pass `undefined` for it so the
                // nextSibling getter lands in the 4th arg position.
                if (anchorlessIf) push(ctx, `undefined,`);
            }
            if (anchorlessIf) {
                ctx.imports.add('firstNode');
                push(ctx, `() => ${op.nextSiblingRef ?? 'null'},`);
                if (op.prevSiblingRef && op.prevSiblingRef !== 'null') {
                    ctx.imports.add('lastNode');
                }
                // A conditional that renders NO bookends (LEGACY `if:true`/`if:false`, or
                // ANY slotted `lwc:if` — engine-core flattens slotted fragment delimiters)
                // → pass `true` for the `noBookends` arg so createIf inserts only content.
                const noBookends = op.noBookends === true || op.legacy === true;
                push(
                    ctx,
                    noBookends
                        ? `() => ${op.prevSiblingRef ?? 'null'},`
                        : `() => ${op.prevSiblingRef ?? 'null'}`
                );
                if (noBookends) push(ctx, `true`);
            }
            ctx.indent--;
            push(ctx, `);`);
            break;
        }
        case IRNodeTypes.FOR: {
            const forHelper = op.iterator ? 'createIterator' : 'createFor';
            ctx.imports.add(forHelper);
            push(ctx, `const ${op.varName} = ${forHelper}(`);
            ctx.indent++;
            push(ctx, `() => ${prefixExpression(op.source, ctx.locals, ctx.refLocals)},`);
            push(ctx, `(${op.item}${op.index ? ', ' + op.index : ''}) => {`);
            ctx.indent++;
            // The for-item and for-index identifiers are local within the body
            // and the key expression; do not prefix them with `$cmp.`. The index
            // is passed as a reactive ref so reused blocks update their index on
            // keyed reorder; its reads emit `.value`.
            const addedItem = !ctx.locals.has(op.item);
            const addedIndex = op.index ? !ctx.locals.has(op.index) : false;
            ctx.locals.add(op.item);
            if (op.index) {
                ctx.locals.add(op.index);
                ctx.refLocals.add(op.index);
            }
            generateBlock(ctx, op.body);
            ctx.indent--;
            // ANCHORLESS mode (engine-core api_iterator): pass the key (or `undefined`)
            // then a `nextSibling` getter so the list positions its items before the
            // following block without contributing a delimiter comment.
            const anchorlessFor = op.anchorless === true;
            if (op.key) {
                push(ctx, `},`);
                push(
                    ctx,
                    anchorlessFor
                        ? `(${op.item}) => ${prefixExpression(op.key, ctx.locals, ctx.refLocals)},`
                        : `(${op.item}) => ${prefixExpression(op.key, ctx.locals, ctx.refLocals)}`
                );
            } else {
                push(ctx, anchorlessFor ? `},` : `}`);
                if (anchorlessFor) push(ctx, `undefined,`);
            }
            if (anchorlessFor) {
                ctx.imports.add('firstNode');
                push(ctx, `() => ${op.nextSiblingRef ?? 'null'},`);
                if (op.prevSiblingRef && op.prevSiblingRef !== 'null') {
                    ctx.imports.add('lastNode');
                }
                push(ctx, `() => ${op.prevSiblingRef ?? 'null'}`);
            }
            if (addedItem) ctx.locals.delete(op.item);
            if (addedIndex && op.index) {
                ctx.locals.delete(op.index);
                ctx.refLocals.delete(op.index);
            }
            ctx.indent--;
            push(ctx, `);`);
            break;
        }
        case IRNodeTypes.SLOT: {
            ctx.imports.add('createSlot');
            // `lwc:slot-bind={expr}` exposes data to scoped-slot content: pass it
            // as a getter so the slot fn receives (and reactively tracks) the data.
            const bindExpr = op.bind
                ? `() => ${prefixExpression(op.bind, ctx.locals, ctx.refLocals)}`
                : 'undefined';
            // The slot's children are its fallback content, rendered when no
            // slotted content is provided for this slot name.
            let fallbackExpr = 'undefined';
            if (op.fallback) {
                const lines: string[] = [];
                const sub: CodegenContext = {
                    ...ctx,
                    code: lines,
                    indent: 0,
                    locals: new Set(ctx.locals),
                    refLocals: new Set(ctx.refLocals),
                };
                generateBlock(sub, op.fallback);
                const body = lines.map((l) => '            ' + l).join('\n');
                fallbackExpr = `() => {\n${body}\n        }`;
            }
            // A forwarding `<slot slot="Y">` re-tags its resolved content with
            // `slot="Y"` (trailing arg). Static value → a string; dynamic
            // `slot={expr}` → a getter so re-tagging tracks the expression.
            let forwardArg = '';
            if (op.forwardAsExpr !== undefined) {
                forwardArg = `, () => ${prefixExpression(op.forwardAsExpr, ctx.locals, ctx.refLocals)}`;
            } else if (op.forwardAs !== undefined) {
                forwardArg = `, ${JSON.stringify(op.forwardAs)}`;
            }
            push(
                ctx,
                `const ${op.varName} = createSlot(${JSON.stringify(op.name)}, $slotset, ${fallbackExpr}, ${bindExpr}${forwardArg});`
            );
            break;
        }
        case IRNodeTypes.COMPONENT: {
            const dynamicGetters = op.props.map(
                (p) =>
                    `${JSON.stringify(p.key)}: () => ${prefixExpression(
                        p.expression,
                        ctx.locals,
                        ctx.refLocals
                    )}`
            );
            const staticGetters = (op.staticProps ?? []).map(
                (p) =>
                    `${JSON.stringify(p.key)}: () => ${p.bool ? 'true' : JSON.stringify(p.value)}`
            );
            const propGetters = [...dynamicGetters, ...staticGetters].join(', ');
            // Constructor source: a static import for a known tag, or a runtime
            // expression for lwc:is/lwc:dynamic. Pass spread as an optional getter.
            let ctorExpr: string;
            let tagExpr: string;
            const isDynamic = !!op.dynamicCtor;
            if (op.dynamicCtor) {
                // Dynamic ctor passed as a getter so the runtime can re-resolve it
                // reactively (it may start undefined and resolve later, or change).
                ctorExpr = `() => ${prefixExpression(op.dynamicCtor, ctx.locals, ctx.refLocals)}`;
                tagExpr = JSON.stringify(op.tag === 'lwc:component' ? 'lwc-component' : op.tag);
            } else {
                const { specifier, local } = tagToImport(op.tag);
                ctx.componentImports.set(op.tag, { specifier, local });
                ctorExpr = local;
                tagExpr = JSON.stringify(op.tag);
            }
            const factory = isDynamic ? 'createDynamicComponent' : 'createChildComponent';
            ctx.imports.add(factory);
            const spreadExpr = op.spread
                ? `() => ${prefixExpression(op.spread, ctx.locals, ctx.refLocals)}`
                : 'undefined';
            // Build the slot set: { slotName: (slotData?) => Block } for each
            // slotted group. Scoped slots (`lwc:slot-data="x"`) take the bound data
            // as a parameter `x` which is a LOCAL (so `x.id` is not prefixed $cmp.).
            let slotsExpr = 'undefined';
            const buildSlotFn = (blk: BlockIR, slotData?: string): string => {
                const lines: string[] = [];
                // Own locals/refLocals sets so registering the scoped-slot data
                // param doesn't leak into the parent codegen context.
                const sub: CodegenContext = {
                    ...ctx,
                    code: lines,
                    indent: 0,
                    locals: new Set(ctx.locals),
                    refLocals: new Set(ctx.refLocals),
                };
                if (slotData) sub.locals.add(slotData);
                generateBlock(sub, blk);
                const body = lines.map((l) => '            ' + l).join('\n');
                const param = slotData ? slotData : '';
                return `(${param}) => {\n${body}\n        }`;
            };
            // DYNAMIC-slot children (`slot={expr}`) → reserved `$dynamic` key holding an
            // ORDERED array of `{ name: () => expr, fn }` (scoped fn tagged). The runtime
            // distributes each by evaluating its name getter, in document order — so both
            // shadow native projection and the light-DOM resolver preserve ordering.
            const buildDynamic = (): string => {
                const dyn = op
                    .dynamicSlots!.map((d) => {
                        const fnExpr = buildSlotFn(d.block, d.slotData);
                        const nameGetter = `() => ${prefixExpression(
                            d.nameExpr,
                            ctx.locals,
                            ctx.refLocals
                        )}`;
                        const fnPart = d.scoped
                            ? (ctx.imports.add('scopedSlot'), `scopedSlot(${fnExpr})`)
                            : fnExpr;
                        return `{ name: ${nameGetter}, fn: ${fnPart} }`;
                    })
                    .join(', ');
                return `"$dynamic": [${dyn}]`;
            };
            if (op.slots && op.slots.length) {
                const entries = op.slots.map((s) => {
                    // A scoped-slot entry (declared via `<template lwc:slot-data>`)
                    // is tagged with `scopedSlot(...)` so the runtime can detect a
                    // parent/child slot-type mismatch (scoped vs standard).
                    const fnExpr = buildSlotFn(s.block, s.slotData);
                    if (s.slotData !== undefined) {
                        ctx.imports.add('scopedSlot');
                        return `${JSON.stringify(s.name || '')}: scopedSlot(${fnExpr})`;
                    }
                    return `${JSON.stringify(s.name || '')}: ${fnExpr}`;
                });
                if (op.dynamicSlots && op.dynamicSlots.length) entries.push(buildDynamic());
                slotsExpr = `{ ${entries.join(', ')} }`;
            } else if (op.dynamicSlots && op.dynamicSlots.length) {
                slotsExpr = `{ ${buildDynamic()} }`;
            }
            // Dynamic components return a fragment (not an element); their
            // `lwc:ref` is wired by the runtime (passed as a trailing arg) when the
            // inner host resolves. Static child components get a direct applyRefs.
            if (isDynamic) {
                if (op.ref && ctx.hasRefs) ctx.hasRefs.value = true;
                const refArg = op.ref ? `, ${JSON.stringify(op.ref)}` : '';
                // Host event listeners on a dynamic component (`<lwc:component
                // lwc:is={ctor} onclick={fn}>`) can't be attached to the returned
                // fragment, so pass them to createDynamicComponent which binds them
                // to the resolved host inside its factory. Positional args:
                // factory(tag, ctor, props, slots, spread, refName?, events?).
                let trailing = refArg;
                if (op.events && op.events.length) {
                    const evs = op.events
                        .map(({ event, handler }) => {
                            const h = prefixExpression(handler, ctx.locals, ctx.refLocals);
                            return `{ event: ${JSON.stringify(event)}, handler: e => ${h}(e) }`;
                        })
                        .join(', ');
                    trailing = `, ${op.ref ? JSON.stringify(op.ref) : 'undefined'}, [${evs}]`;
                }
                push(
                    ctx,
                    `const ${op.varName} = ${factory}(${tagExpr}, ${ctorExpr}, { ${propGetters} }, ${slotsExpr}, ${spreadExpr}${trailing});`
                );
            } else {
                push(
                    ctx,
                    `const ${op.varName} = ${factory}(${tagExpr}, ${ctorExpr}, { ${propGetters} }, ${slotsExpr}, ${spreadExpr});`
                );
                if (op.ref) {
                    ctx.imports.add('applyRefs');
                    push(ctx, `applyRefs(${op.varName}, ${JSON.stringify(op.ref)});`);
                }
                // Event listeners on the child component host (`<x-child
                // onclick={fn}>`). Use the non-delegated `on(...)` so the listener
                // is attached directly to the host element (additive with any
                // `lwc:spread` event listeners applied at mount).
                if (op.events) {
                    for (const { event, handler } of op.events) {
                        ctx.imports.add('on');
                        const h = prefixExpression(handler, ctx.locals, ctx.refLocals);
                        push(ctx, `on(${op.varName}, ${JSON.stringify(event)}, e => ${h}(e));`);
                    }
                }
                // `lwc:on={obj}` on a child component host: bind each property of the
                // object as an event listener on the host. Emitted right after the
                // host element is created (the child's construction/connect is
                // DEFERRED to insertion), so the listeners are present BEFORE the
                // child's connectedCallback fires — matching engine-core (lwc:on
                // "event listeners are added before child's connectedCallback").
                if (op.lwcOn) {
                    ctx.imports.add('spreadEvents');
                    const obj = prefixExpression(op.lwcOn, ctx.locals, ctx.refLocals);
                    push(ctx, `spreadEvents(${op.varName}, ${obj}, $cmp);`);
                }
            }
            break;
        }
        default:
            break;
    }

    // If this dynamic node is nested inside a static parent element, insert it
    // at its anchor (a comment node) instead of leaving it to be returned.
    if (
        (op.type === IRNodeTypes.IF ||
            op.type === IRNodeTypes.FOR ||
            op.type === IRNodeTypes.SLOT ||
            op.type === IRNodeTypes.COMPONENT) &&
        op.insertInto
    ) {
        // A STATIC child component's positional anchor is a one-time placeholder
        // (never reused for a re-render), so insert-then-remove it via insertStatic
        // to keep the parent's child list free of a stray trailing `<!---->`
        // (matching engine-dom's DOM shape). IF/FOR/SLOT anchors and DYNAMIC
        // components must KEEP their anchor (re-render/teardown reference it).
        // An ANCHORLESS for:each is inserted in a SEPARATE post-pass (see
        // generateBlock), because its next-sibling expression may reference a control-
        // flow block declared LATER in document order (TDZ); deferring all anchorless
        // inserts until after every `const dN = ...` creation makes those refs valid.
        if (
            (op.type === IRNodeTypes.FOR || op.type === IRNodeTypes.IF) &&
            (op as { anchorless?: boolean }).anchorless
        ) {
            return;
        }
        const isStaticComponent = op.type === IRNodeTypes.COMPONENT && !op.dynamicCtor;
        const fn = isStaticComponent ? 'insertStatic' : 'insert';
        ctx.imports.add(fn);
        push(ctx, `${fn}(${op.varName}, ${op.insertInto.parentRef}, ${op.insertInto.anchorRef});`);
    }
}

function generateEffect(ctx: CodegenContext, effect: EffectIR): void {
    ctx.imports.add('renderEffect');
    if (effect.operations.length === 1) {
        push(ctx, `renderEffect(() => ${generateEffectOperation(ctx, effect.operations[0])});`);
    } else {
        push(ctx, `renderEffect(() => {`);
        ctx.indent++;
        for (const op of effect.operations) {
            push(ctx, `${generateEffectOperation(ctx, op)};`);
        }
        ctx.indent--;
        push(ctx, `});`);
    }
}

function generateEffectOperation(ctx: CodegenContext, op: OperationIR): string {
    switch (op.type) {
        case IRNodeTypes.SET_PROP:
            if (op.external) {
                // `lwc:external` bound attribute: prop-iff-camelCase-in-element,
                // else attribute (engine-core attrs.ts heuristic).
                ctx.imports.add('setExternalAttr');
                return `setExternalAttr(${op.ref}, ${JSON.stringify(op.prop)}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
            }
            ctx.imports.add('setProp');
            return `setProp(${op.ref}, ${JSON.stringify(op.prop)}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
        case IRNodeTypes.SET_ATTR:
            ctx.imports.add('setAttr');
            return `setAttr(${op.ref}, ${JSON.stringify(op.attr)}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
        case IRNodeTypes.SET_CLASS:
            ctx.imports.add('setClass');
            return `setClass(${op.ref}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
        case IRNodeTypes.SET_STYLE:
            ctx.imports.add('setStyle');
            return `setStyle(${op.ref}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
        case IRNodeTypes.SET_TEXT:
            ctx.imports.add('setText');
            return `setText(${op.ref}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
        case IRNodeTypes.SET_DYNAMIC_PROPS:
            if (op.external) {
                ctx.imports.add('setExternalDynamicProps');
                return `setExternalDynamicProps(${op.ref}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
            }
            ctx.imports.add('setDynamicProps');
            return `setDynamicProps(${op.ref}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
        case IRNodeTypes.SET_HTML:
            ctx.imports.add('setHtml');
            return `setHtml(${op.ref}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)})`;
        case IRNodeTypes.LWC_ON:
            ctx.imports.add('spreadEvents');
            // Pass $cmp as the owner so handlers run with `this` = the component.
            return `spreadEvents(${op.ref}, ${prefixExpression(op.expression, ctx.locals, ctx.refLocals)}, $cmp)`;
        default:
            return '/* unknown */';
    }
}

function collectDelegatedEvents(block: BlockIR): Set<string> {
    const events = new Set<string>();
    const visit = (b: BlockIR) => {
        for (const op of b.operations) {
            if (op.type === IRNodeTypes.SET_EVENT && op.delegated) {
                events.add(op.event);
            } else if (op.type === IRNodeTypes.IF) {
                visit(op.positive);
                if (op.negative) visit(op.negative);
            } else if (op.type === IRNodeTypes.FOR) {
                visit(op.body);
            } else if (op.type === IRNodeTypes.COMPONENT) {
                // A delegated handler (e.g. `<button onclick={fn}>`) may live inside
                // a child component's SLOTTED content. Those slot blocks render into
                // the SAME document (a delegated listener is a single document-level
                // listener), so their delegated events must be collected here too —
                // otherwise `delegateEvents("click")` is never emitted and the
                // document listener is missing (handler never fires).
                if (op.slots) {
                    for (const s of op.slots) visit(s.block);
                }
            } else if (op.type === IRNodeTypes.SLOT) {
                // A `<slot>`'s fallback content can likewise contain delegated handlers.
                if (op.fallback) visit(op.fallback);
            }
        }
    };
    visit(block);
    return events;
}

function push(ctx: CodegenContext, line: string): void {
    if (line === '') {
        ctx.code.push('');
        return;
    }
    ctx.code.push('    '.repeat(ctx.indent) + line);
}
