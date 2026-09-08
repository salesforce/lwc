/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { EffectScope, getActiveScope } from './scope';
import type { VaporComponentInstance } from './component';

export type Block = Node | VaporFragment | DynamicFragment | VaporComponentInstance | Block[];

export type BlockFn = () => Block;

export class VaporFragment {
    nodes: Block;
    anchor?: Node;
    /**
     * When the fragment's trailing anchor is SUPPRESSED at a shadow/host root top
     * (engine-dom leaves no delimiter node there), this records the container the
     * fragment was appended into, so the owner (e.g. `createFor`) can still resolve
     * its parent for reconciliation without a DOM-attached anchor.
     */
    suppressedParent?: ParentNode;
    /** Opt-in: this fragment's trailing anchor may be suppressed at a root top
     *  (set by `createFor`; a plain VaporFragment keeps its anchor). */
    anchorSuppressible?: boolean;
    /** Opt-in (ANCHORLESS for:each): this fragment contributes NO delimiter comment.
     *  At insert time `insertBlock` records the container as `suppressedParent` and
     *  inserts only the fragment's content (before the passed anchor, if any). The
     *  owner (`createFor`) positions items via `suppressedParent` + a lazily-resolved
     *  next-sibling getter — matching engine-core's `api_iterator` (a for:each adds
     *  zero bookends; the only delimiters come from the items themselves). */
    anchorless?: boolean;

    constructor(nodes: Block = [], anchor?: Node) {
        this.nodes = nodes;
        this.anchor = anchor;
    }
}

export class DynamicFragment extends VaporFragment {
    override anchor: Node;
    /**
     * Leading bookend comment placed BEFORE the fragment's content. Engine-core
     * brackets each dynamic fragment with a start+end comment (`<!---->`); content
     * lives between `start` and `anchor` (end). This matches LWC's DOM shape so
     * innerHTML/childNodes comparisons line up.
     */
    readonly start: Node;

    /** True once this fragment's own end anchor has been placed in the DOM. */
    anchorInserted = false;

    /**
     * ANCHORLESS mode (engine-core parity for `lwc:if`/`for:each` content): when set,
     * this fragment keeps NO persistent DOM marker. Its bookend PAIR (`start`+`anchor`)
     * is inserted ONLY around rendered content and removed entirely when the branch is
     * empty — so an empty `lwc:if` contributes ZERO nodes (engine-dom: `lwc:if` false
     * renders nothing, not a stray comment). `getNextSibling()` lazily resolves the DOM
     * node the content must stay BEFORE (the following sibling block's first node, or
     * null = append); the real parent is resolved from current content / siblings.
     */
    anchorlessIf = false;
    /** Lazy next-sibling resolver for anchorless mode (set by createIf). */
    getNextSibling?: () => Node | null;
    /** Lazy parent resolver for anchorless mode (set by createIf). */
    getParent?: () => ParentNode | null;
    /** The container this anchorless fragment was inserted into at mount (the last-
     *  resort parent when next/prev siblings + own content can't resolve a live one). */
    recordedParent?: ParentNode | null;
    /** LEGACY `if:true`/`if:false`: insert ONLY content, no `start`/`anchor` bookend
     *  comments (engine-dom emits zero delimiters for the legacy directives). */
    noBookends = false;

    constructor(anchorLabel?: string) {
        const anchor = document.createComment(anchorLabel || '');
        super([], anchor);
        this.anchor = anchor;
        this.start = document.createComment('');
        this.anchorInserted = false;
        // Mark BOTH bookends as a fragment's OWN markers so another fragment inserted
        // before either does not ADOPT it (adoption is only for compiler-emitted
        // template anchors). Marking only the end `anchor` left the leading `start`
        // comment adoptable: when a keyed `for:each` PREPENDS a new conditional item,
        // its fresh fragment was inserted before the next item's `start` comment and
        // wrongly adopted it as its own end anchor, collapsing the bookend pair and
        // mis-ordering the list (directive-if-elseif-else foreach: `h240f` vs `h024f`).
        (anchor as { __ownerFrag?: boolean }).__ownerFrag = true;
        (this.start as { __ownerFrag?: boolean }).__ownerFrag = true;
        // CASCADE TEARDOWN: a DynamicFragment created inside an active EffectScope (e.g.
        // a scoped-slot body's `createIf`, built while the ENCLOSING createSlot's
        // `frag.update` scope is active) holds its content in a SEPARATE inner scope
        // created per `update()`. EffectScope has no parent→child linkage, so stopping
        // the enclosing scope would NOT stop this fragment's live content scope — its
        // renderEffects survive and keep firing after teardown (a stale scoped-slot
        // `createIf` re-rendered its `scopedSlotFragment` branch OUTSIDE any createSlot
        // body when its condition flipped, invoking the factory with no bound data and
        // throwing on `data.id`). Register a dispose on the CONSTRUCTION scope so this
        // fragment's current content scope is stopped when the enclosing scope tears down.
        const enclosingScope = getActiveScope();
        if (enclosingScope) {
            enclosingScope.register(() => {
                if (this.scope) {
                    this.scope.stop();
                    this.scope = undefined;
                }
            });
        }
    }

    /** Adopt a compiler-emitted comment as this fragment's end anchor. */
    useEndAnchor(node: Node): void {
        this.anchor = node;
        this.anchorInserted = true;
        // Once adopted, this node is THIS fragment's end-anchor — a nested
        // fragment inserted before it must not re-adopt it (which would collapse a
        // bookend pair).
        (node as { __ownerFrag?: boolean }).__ownerFrag = true;
    }

    update(render?: BlockFn, key: any = render): void {
        if (key === this.currentKey) {
            return;
        }
        this.currentKey = key;

        if (this.anchorlessIf) {
            this.updateAnchorless(render);
            return;
        }

        const parent = this.anchor.parentNode;

        // engine-core mounts the NEW branch BEFORE tearing down the old one, so a
        // toggle fires the new content's connectedCallback BEFORE the old content's
        // disconnectedCallback (light-dom/lifecycle slot-forwarding "invokes lifecycle
        // methods in correct order": [3,4,5 cc, 2,0,1 dc]). Render+insert new first
        // (it lands between the old nodes and the anchor), THEN remove the old.
        const prevScope = this.scope;
        const prevNodes = this.nodes;

        if (render) {
            // Render the new branch inside its own effect scope so it can be
            // torn down independently on the next switch. Content is inserted
            // before the end anchor (and thus after the start bookend).
            const scope = new EffectScope();
            this.scope = scope;
            this.nodes = scope.run(render);
            if (parent) {
                insertBlock(this.nodes, parent, this.anchor);
            }
        } else {
            this.scope = undefined;
            this.nodes = [];
        }

        // DUPLICATE-SLOT lifecycle parity (#3827): BEFORE tearing the old branch down,
        // let the wired hook decide whether to SUPPRESS the previous slotted leaf's
        // disconnectedCallback — engine-core's light-DOM keyed-slot diff omits it when a
        // top-level `lwc:if`'s DIRECT branch is replaced by its NESTED `lwc:if` branch
        // (both projecting the same duplicated `<slot>` content).
        if (dupSlotDcPreHook) {
            dupSlotDcPreHook(prevNodes, this.nodes);
        }

        // Teardown the PREVIOUS branch: stop its effects and remove its nodes (after
        // the new branch is mounted, so connect-before-disconnect ordering holds).
        if (prevScope) {
            prevScope.stop();
            if (parent) {
                removeBlock(prevNodes, parent);
            }
        }

        // DUPLICATE-SLOT lifecycle parity (#3827): after a branch toggle over duplicated
        // `<slot>`s, engine-core's light-DOM keyed-slot diff emits a SPURIOUS
        // disconnectedCallback on the newly-connected slotted leaf. The wired hook
        // reproduces it (callback only — the instance stays mounted) for the narrow
        // slotted-across-conditional case.
        if (dupSlotDcHook) {
            dupSlotDcHook(prevNodes, this.nodes);
        }
    }

    /**
     * ANCHORLESS update: the bookend pair (`start`+`anchor`) lives in the DOM ONLY
     * while there is rendered content. On switch to an empty branch, BOTH bookends and
     * the content are removed (an empty `lwc:if` contributes zero nodes, matching
     * engine-dom). On switch to content, the bookends are (re)inserted bracketing the
     * content before the lazily-resolved next sibling.
     */
    private updateAnchorless(render?: BlockFn): void {
        // Resolve the live parent: the current content/bookend's parent (if attached),
        // else next sibling's parent, else the owner-provided resolver.
        const resolveLiveParent = (): ParentNode | null =>
            this.start.parentNode ??
            firstNode(this.nodes)?.parentNode ??
            (this.getNextSibling && this.getNextSibling()?.parentNode) ??
            (this.getParent ? this.getParent() : null) ??
            null;
        let parent = resolveLiveParent();

        // Teardown previous branch: stop effects, remove its nodes AND its bookends.
        if (this.scope) {
            this.scope.stop();
            this.scope = undefined;
            if (parent) removeBlock(this.nodes, parent);
        }
        if (this.start.parentNode) this.start.parentNode.removeChild(this.start);
        if (this.anchor.parentNode) this.anchor.parentNode.removeChild(this.anchor);
        this.anchorInserted = false;

        if (render) {
            const scope = new EffectScope();
            this.scope = scope;
            // While rendering content, expose THIS fragment's trailing boundary to any
            // NESTED anchorless block so it inserts before our end, not past it.
            const myBoundary = (): Node | null => {
                if (this.anchor.parentNode) return this.anchor;
                return this.getNextSibling ? this.getNextSibling() : null;
            };
            pushEnclosingBoundary(myBoundary);
            try {
                this.nodes = scope.run(render);
            } finally {
                popEnclosingBoundary();
            }
            // Re-resolve parent now that the old content/bookends are gone.
            if (!parent) {
                parent =
                    (this.getNextSibling && this.getNextSibling()?.parentNode) ??
                    (this.getParent ? this.getParent() : null) ??
                    null;
            }
            if (parent) {
                const before = this.resolveBefore(parent);
                // LEGACY `if:true`/`if:false`: NO bookends — insert content only.
                if (!this.noBookends) parent.insertBefore(this.start, before);
                insertBlock(this.nodes, parent, before);
                if (!this.noBookends) {
                    parent.insertBefore(this.anchor, before);
                    this.anchorInserted = true;
                }
            }
        } else {
            this.nodes = [];
        }
    }

    /** The enclosing anchorless block's trailing boundary, CAPTURED at this fragment's
     *  construction (so a re-render/toggle outside the original render context still
     *  knows where the encloser ends). Set by createIf/createFor. */
    enclosingBoundary?: () => Node | null;

    /** Resolve the node to insert before: own next sibling, else the enclosing block's
     *  captured boundary (so a nested anchorless block lands before its encloser's end),
     *  else null (append). Only a node currently in `parent` is usable. */
    private resolveBefore(parent: ParentNode): Node | null {
        const nx = this.getNextSibling ? this.getNextSibling() : null;
        if (nx && nx.parentNode === parent) return nx;
        if (this.enclosingBoundary) {
            const eb = this.enclosingBoundary();
            if (eb && eb.parentNode === parent) return eb;
        }
        return null;
    }

    private currentKey: any = undefined;
    private scope: EffectScope | undefined;
}

// DUPLICATE-SLOT lifecycle parity (#3827): hook wired by the compat layer to
// reproduce engine-core's light-DOM duplicate-slot spurious disconnectedCallback on
// the newly-connected slotted leaf after a conditional branch toggle.
let dupSlotDcHook: ((prevNodes: Block, newNodes: Block) => void) | null = null;
export function setDupSlotDcHook(fn: (prevNodes: Block, newNodes: Block) => void): void {
    dupSlotDcHook = fn;
}
// Pre-teardown counterpart: SUPPRESS the previous slotted leaf's disconnectedCallback
// for the direct-branch → nested-branch transition (engine-core omits it there).
let dupSlotDcPreHook: ((prevNodes: Block, newNodes: Block) => void) | null = null;
export function setDupSlotDcPreHook(fn: (prevNodes: Block, newNodes: Block) => void): void {
    dupSlotDcPreHook = fn;
}

/** Does a block CONTAIN a nested DynamicFragment (a `createIf`) somewhere in its
 *  content? Used to tell a top-level `createIf`'s DIRECT branch from its
 *  NESTED-`createIf` branch (#3827 duplicate-slot lifecycle parity). */
export function containsNestedDynamicFragment(block: Block): boolean {
    if (block == null || block instanceof Node) return false;
    if (block instanceof DynamicFragment) return true;
    if (block instanceof VaporFragment) return containsNestedDynamicFragment(block.nodes);
    if (Array.isArray(block)) {
        for (const b of block) if (containsNestedDynamicFragment(b)) return true;
        return false;
    }
    if (block && 'block' in (block as any)) {
        return containsNestedDynamicFragment((block as { block?: Block }).block!);
    }
    return false;
}

// Re-exported for back-compat with modules that imported it from here.
export { onScopeDispose, getActiveScope } from './scope';

/**
 * ENCLOSING-BOUNDARY context for nested anchorless blocks. An anchorless `lwc:if`/
 * `for:each` resolves its insertion point from its NEXT SIBLING; but when it is NESTED
 * inside another anchorless block's content and is the LAST item there, its own
 * next-sibling chain resolves null — it would then append past the enclosing block's
 * end. To bound it, an anchorless block pushes its OWN trailing boundary (its `anchor`,
 * or its own next-sibling getter) onto this stack while rendering its content; a nested
 * block uses the top of the stack as its fallback "next sibling" (so it inserts BEFORE
 * the enclosing block's end, preserving order across block boundaries).
 */
const enclosingBoundaryStack: Array<() => Node | null> = [];
export function pushEnclosingBoundary(fn: () => Node | null): void {
    enclosingBoundaryStack.push(fn);
}
export function popEnclosingBoundary(): void {
    enclosingBoundaryStack.pop();
}
export function currentEnclosingBoundary(): (() => Node | null) | undefined {
    return enclosingBoundaryStack[enclosingBoundaryStack.length - 1];
}

/**
 * The first DOM node a block currently occupies, or null. Used by an ANCHORLESS
 * `for:each` to resolve the node it must stay BEFORE (the following sibling block's
 * leading node) at reconcile time — the analog of engine-core inserting an iterator's
 * children before the next vnode. A DynamicFragment's leading `start` bookend is its
 * first node when present (so insertion lands BEFORE the fragment's bookends, not
 * inside them); an empty/anchor-only fragment falls back to its anchor.
 */
export function firstNode(block: Block): Node | null {
    if (block == null) return null;
    if (block instanceof Node) return block;
    if (Array.isArray(block)) {
        for (const b of block) {
            const n = firstNode(b);
            if (n) return n;
        }
        return null;
    }
    if (block instanceof DynamicFragment) {
        // ANCHORLESS fragment: its `start` bookend is its first node when it has content;
        // when EMPTY it has NO DOM nodes, so its "first node" is whatever comes AFTER it —
        // delegate to its own next-sibling resolver (chains through empty anchorless
        // siblings). Without this, an `lwc:if` positioned before an EMPTY anchorless
        // `lwc:if` would resolve `null` and append to the end (element-orders: a `3`
        // between static `2` and `5` jumped to the end).
        if (block.anchorlessIf) {
            if (block.start && block.start.parentNode) return block.start;
            const inner = firstNode(block.nodes);
            if (inner) return inner;
            return block.getNextSibling ? block.getNextSibling() : null;
        }
        if (block.start && block.start.parentNode) return block.start;
        return firstNode(block.nodes) ?? block.anchor ?? null;
    }
    if (block instanceof VaporFragment) {
        return firstNode(block.nodes) ?? block.anchor ?? null;
    }
    if (block && 'block' in (block as any)) return firstNode((block as { block?: Block }).block!);
    return null;
}

/**
 * The LAST DOM node a block currently occupies, or null. The mirror of `firstNode`,
 * used by an ANCHORLESS append-mode `for:each` to resolve its real parent from the
 * PRECEDING sibling (whose last node stays live in the real root after a cloned
 * fragment flush). A fragment's trailing `anchor` is its last node when present.
 */
export function lastNode(block: Block): Node | null {
    if (block == null) return null;
    if (block instanceof Node) return block;
    if (Array.isArray(block)) {
        for (let i = block.length - 1; i >= 0; i--) {
            const n = lastNode(block[i]);
            if (n) return n;
        }
        return null;
    }
    if (block instanceof VaporFragment) {
        if (block.anchor && block.anchor.parentNode) return block.anchor;
        return lastNode(block.nodes) ?? block.anchor ?? null;
    }
    if (block && 'block' in (block as any)) return lastNode((block as { block?: Block }).block!);
    return null;
}

/** A node into which children can be inserted. */
function isInsertableParent(node: Node | null | undefined): node is ParentNode {
    if (!node) return false;
    const t = node.nodeType;
    // ELEMENT_NODE (1), DOCUMENT_FRAGMENT_NODE (11) — includes ShadowRoot.
    return t === 1 || t === 11 || t === 9;
}

/**
 * Returns a usable parent container. The passed `parent` may be stale or (in
 * nested-insertion cases) not actually the DOM parent of the anchor. Prefer the
 * anchor's real parent; if neither the anchor's parent nor the passed parent is
 * a valid container (e.g. a Text node was passed as `parent`), walk up from the
 * anchor to the nearest insertable ancestor.
 */
function resolveParent(parent: ParentNode, anchor: Node | null): ParentNode {
    const anchorParent = anchor?.parentNode;
    if (isInsertableParent(anchorParent)) {
        return anchorParent;
    }
    if (isInsertableParent(parent)) {
        return parent;
    }
    // Walk up from the anchor (or the passed parent) to a valid container.
    let cursor: Node | null | undefined = anchor ?? (parent as unknown as Node);
    let guard = 0;
    while (cursor && !isInsertableParent(cursor) && guard++ < 10000) {
        cursor = cursor.parentNode;
    }
    return (cursor as ParentNode) ?? parent;
}

export function insertBlock(block: Block, parent: ParentNode, anchor: Node | null = null): void {
    const target = resolveParent(parent, anchor);
    if (block instanceof Node) {
        target.insertBefore(block, anchor && anchor.parentNode === target ? anchor : null);
    } else if (block instanceof DynamicFragment) {
        // ANCHORLESS `lwc:if` (engine-core parity): the bookend pair lives in the DOM
        // ONLY around rendered content; an empty branch contributes ZERO nodes. Insert
        // the content (bracketed by start/anchor) before `anchor`, or nothing if empty.
        // Record a parent/next-sibling resolver so later toggles re-place correctly.
        if (block.anchorlessIf) {
            const before = anchor && anchor.parentNode === target ? anchor : null;
            block.recordedParent = target;
            const hasContent = firstNode(block.nodes) != null;
            if (hasContent) {
                // LEGACY `if:true`/`if:false`: NO bookends — insert content only.
                if (!block.noBookends) target.insertBefore(block.start, before);
                insertBlock(block.nodes, target, before);
                if (!block.noBookends) {
                    target.insertBefore(block.anchor, before);
                    block.anchorInserted = true;
                }
            }
            return;
        }
        // If a compiler-emitted `<!---->` anchor is provided (already in the static
        // template at this control-flow position), ADOPT it as the fragment's end
        // anchor instead of inserting a duplicate — then only the leading `start`
        // bookend is added. Otherwise (top-level fragment, no template anchor)
        // insert both bookends.
        if (
            anchor &&
            anchor.nodeType === 8 /* Comment */ &&
            anchor.parentNode === target &&
            !block.anchorInserted &&
            // Don't adopt another fragment's OWN end-anchor — only a bare
            // compiler-emitted template anchor. Adopting a parent fragment's
            // anchor would collapse a pair of bookends when nesting fragments.
            !(anchor as { __ownerFrag?: boolean }).__ownerFrag
        ) {
            block.useEndAnchor(anchor);
            target.insertBefore(block.start, anchor);
            insertBlock(block.nodes, target, anchor);
        } else {
            const before = anchor && anchor.parentNode === target ? anchor : null;
            // Suppress the leading bookend ONLY when this fragment is the very FIRST
            // node at the top level of a ShadowRoot (engine-core shadow roots have no
            // leading comment node there, and test tree-walkers assume element
            // children). When APPENDING after existing content (e.g. a `for:each` item's
            // `lwc:if` placed after a preceding block), the leading bookend IS present —
            // so gate on the root being empty, not merely on append (`!before`).
            const atShadowTop =
                typeof ShadowRoot !== 'undefined' &&
                target instanceof ShadowRoot &&
                !before &&
                target.firstChild === null;
            if (!atShadowTop) {
                target.insertBefore(block.start, before);
            }
            insertBlock(block.nodes, target, anchor);
            target.insertBefore(block.anchor, before);
            block.anchorInserted = true;
        }
    } else if (block instanceof VaporFragment) {
        // ANCHORLESS fragment (for:each): insert only the content (before `anchor`,
        // which is the following sibling's stable leading node, or null = append) and
        // record the container so the owner can reconcile without a delimiter comment.
        // Contributes ZERO comments — engine-core's `api_iterator` shape.
        if (block.anchorless) {
            const before = anchor && anchor.parentNode === target ? anchor : null;
            insertBlock(block.nodes, target, before);
            block.suppressedParent = target;
            return;
        }
        // A keyed `for:each` inserts EVERY row-fragment before ONE shared external
        // compiler `<!---->` anchor. When the FIRST row is itself a DynamicFragment
        // (e.g. a scoped `createSlot` `$scoped` body), that fragment would ADOPT the
        // shared anchor as its OWN end anchor via `useEndAnchor` (its `anchorInserted`
        // is still false, the anchor is bare) — nesting every LATER row INSIDE the
        // first row's start..anchor bracket. A keyed REMOVAL of the first row then
        // sweeps the following rows' elements out (scoped-slot keyed reactivity:
        // the surviving `40 - Video` row vanished after the `39` row was removed).
        // Mark the shared external anchor as OWNED so no row can adopt it; each row
        // then emits its own start/anchor bookends. Insertion order is unchanged and
        // NO extra node is added — only the adoption is suppressed.
        const beforeAnchor = anchor && anchor.parentNode === target ? anchor : null;
        if (block.anchorSuppressible && beforeAnchor && beforeAnchor.nodeType === 8 /* Comment */) {
            (beforeAnchor as { __ownerFrag?: boolean }).__ownerFrag = true;
        }
        insertBlock(block.nodes, target, anchor);
        if (block.anchor) {
            const before = anchor && anchor.parentNode === target ? anchor : null;
            // Suppress the trailing anchor comment when a suppressible fragment
            // (e.g. `for:each`) is appended at the very end of a ShadowRoot or a
            // light-DOM host root: engine-dom leaves no delimiter node there, and a
            // stray `<!---->` as a direct shadow/host child breaks test tree-walkers
            // that call `el.hasAttribute` on every child. The owner resolves its
            // parent via `suppressedParent` instead of the (detached) anchor.
            const atRootTop =
                block.anchorSuppressible &&
                !before &&
                (target.nodeType === 11 /* ShadowRoot/DocumentFragment */ ||
                    target.nodeType === 1); /* host element (light DOM root) */
            if (atRootTop) {
                block.suppressedParent = target;
            } else {
                target.insertBefore(block.anchor, before);
            }
        }
    } else if (Array.isArray(block)) {
        for (const b of block) {
            insertBlock(b, target, anchor);
        }
    } else if (block && 'block' in block) {
        // VaporComponentInstance
        insertBlock(block.block!, target, anchor);
    }
}

export function removeBlock(block: Block, parent: ParentNode): void {
    if (block instanceof Node) {
        // Remove from the node's actual parent; tolerate already-detached nodes.
        const p = block.parentNode;
        if (p) p.removeChild(block);
    } else if (block instanceof DynamicFragment) {
        removeBlock(block.nodes, parent);
        // Sweep any DOM nodes still BETWEEN this fragment's start and anchor that
        // were NOT in `block.nodes`. A nested fragment (e.g. a scoped-slot body's
        // `lwc:if`) that toggled on AFTER this fragment's content was captured
        // inserts its DOM relative to its OWN anchor — so it sits inside this
        // fragment's bookends but isn't tracked by `block.nodes`. Removing this
        // fragment must take it too, else it orphans into the DOM (scoped-slot
        // reactivity "if:true ... is reactive" — 'Variation 2' leaked after the
        // enclosing slot was torn down). Only sweep when both bookends share a parent.
        const sweepParent = block.start.parentNode;
        if (sweepParent && block.anchor && block.anchor.parentNode === sweepParent) {
            let n = block.start.nextSibling;
            while (n && n !== block.anchor) {
                const next = n.nextSibling;
                sweepParent.removeChild(n);
                n = next;
            }
        }
        if (block.start.parentNode) block.start.parentNode.removeChild(block.start);
        if (block.anchor && block.anchor.parentNode) {
            block.anchor.parentNode.removeChild(block.anchor);
        }
    } else if (block instanceof VaporFragment) {
        removeBlock(block.nodes, parent);
        if (block.anchor && block.anchor.parentNode) {
            block.anchor.parentNode.removeChild(block.anchor);
        }
    } else if (Array.isArray(block)) {
        for (const b of block) {
            removeBlock(b, parent);
        }
    } else if (block && 'block' in block) {
        removeBlock(block.block!, parent);
    }
}
