/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { type Block, VaporFragment, DynamicFragment, insertBlock, removeBlock } from './block';
import { renderEffect, runWithSyncNotify, runAsForItem } from './renderEffect';
import { EffectScope } from './scope';
import { shallowRef, type ShallowRef } from './ref';

/**
 * One rendered iteration. Each item owns an `EffectScope` (so its inner render
 * effects can be disposed when the item is removed) and a reactive ref for the
 * item value (so the rendered content updates in place when the item at a given
 * key changes, without re-creating DOM).
 */
interface ForBlock {
    key: any;
    scope: EffectScope;
    itemRef: ShallowRef<any>;
    indexRef: ShallowRef<number>;
    nodes: Block;
    /** The first DOM node of this block, used as a move anchor. */
    firstNode: Node | null;
}

/**
 * Wraps an item ref in a proxy so template bindings can read `item.foo` directly
 * while staying reactive. The proxy is only consulted lazily inside render
 * effects, not on the reconciliation hot path.
 *
 * PERF: the handler is a MODULE-LEVEL SINGLETON (not re-allocated per row). The
 * per-row `ShallowRef` is carried on the proxy TARGET under a private symbol, so
 * `mountItem` allocates ONE object (the `{ [REF]: ref }` target) per row instead
 * of a fresh handler object + 4 trap closures. The traps read the ref off the
 * target (`t[REF]`); a template can never observe `REF` (a private symbol, and
 * the `get` trap resolves every key against the ITEM, not the target).
 */
const REF: unique symbol = Symbol('itemRef');

interface ItemProxyTarget {
    [REF]: ShallowRef<any>;
}

const itemProxyHandler: ProxyHandler<ItemProxyTarget> = {
    get(t, key) {
        const current = t[REF].value as any;
        if (key === Symbol.toPrimitive) return () => current;
        if (current == null) return undefined;
        const v = current[key];
        // Bind plain METHODS so `this` is the item, but NOT class constructors —
        // binding a class breaks its identity (it would no longer be the
        // registered component, so `<lwc:component lwc:is>` couldn't resolve its
        // tag name) and `instanceof`. Classes have a non-writable `prototype`;
        // normal/bound functions don't.
        if (typeof v === 'function') {
            const desc = Object.getOwnPropertyDescriptor(v, 'prototype');
            const isClass = desc !== undefined && desc.writable === false;
            return isClass ? v : v.bind(current);
        }
        return v;
    },
    has(t, key) {
        const current = t[REF].value as any;
        return current != null && key in current;
    },
    ownKeys(t) {
        const current = t[REF].value as any;
        return current != null ? Reflect.ownKeys(current) : [];
    },
    getOwnPropertyDescriptor(t, key) {
        const current = t[REF].value as any;
        if (current == null) return undefined;
        const d = Object.getOwnPropertyDescriptor(current, key);
        if (d) d.configurable = true;
        return d;
    },
};

function itemProxy<T>(ref: ShallowRef<T>): T {
    return new Proxy({ [REF]: ref } as ItemProxyTarget, itemProxyHandler) as T;
}

// Shared sentinel used as the per-row `indexRef` for for:each blocks that never
// read the iteration index. The compiler emits the render callback with arity 1
// (`(item) => ...`) when `for:index` is not declared, and arity 2 (`(item, index)`)
// when it is — so `renderItem.length >= 2` reliably means the index CAN be read.
// When it can't, allocating a real `shallowRef` per row wastes one object + one
// `Dep` Set that nothing ever subscribes to (matches Vue Vapor's `needIndex` gate).
// The setter is a no-op so any reconcile `block.indexRef.value = i` write is harmless,
// and the getter returns -1 defensively (the value is unreachable — no index binding
// exists in an arity-1 body).
const NOOP_INDEX_REF: ShallowRef<number> = {
    get value(): number {
        return -1;
    },
    set value(_next: number) {
        /* no-op: this block never reads the iteration index */
    },
};

function firstNodeOf(block: Block): Node | null {
    if (block instanceof Node) return block;
    if (Array.isArray(block)) {
        for (const b of block) {
            const n = firstNodeOf(b);
            if (n) return n;
        }
        return null;
    }
    if (block instanceof DynamicFragment) {
        // The fragment's leading `start` bookend is its FIRST DOM node — use it as the
        // move/insert anchor. Falling back to the END `anchor` (when the fragment is
        // empty, e.g. a hidden `lwc:if`) is wrong as a "first node": inserting a sibling
        // before the end anchor lands it INSIDE this fragment's bookends, corrupting a
        // keyed reorder (directive-if-elseif-else foreach prepend → `h240f`).
        if (block.start && block.start.parentNode) return block.start;
        return firstNodeOf(block.nodes) ?? block.anchor ?? null;
    }
    if (block instanceof VaporFragment) return firstNodeOf(block.nodes) ?? block.anchor ?? null;
    if (block && 'block' in (block as any)) return firstNodeOf((block as any).block);
    return null;
}

// Context hook (wired by the compat layer): returns the current component's vm
// string (`[object:vm Name (idx)]`) and host tag (`x-foo`) for error messages.
let forContext: (() => { vm: string; tag: string }) | null = null;
export function setForContext(fn: () => { vm: string; tag: string }): void {
    forContext = fn;
}
function ctx(): { vm: string; tag: string } {
    return forContext ? forContext() : { vm: 'instance', tag: 'unknown' };
}

function logForError(message: string): void {
    try {
        throw new Error(`[LWC error]: ${message}`);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }
}

/** Coerce a for:each source to an array, logging a dev error for invalid values. */
function normalizeForSource(value: unknown): unknown[] {
    if (Array.isArray(value)) return value;
    // Iterable (generator, Set, Map, NodeList, etc.).
    if (value != null && typeof (value as any)[Symbol.iterator] === 'function') {
        return Array.from(value as Iterable<unknown>);
    }
    // Array-like (has numeric length).
    if (value != null && typeof (value as any).length === 'number') {
        return Array.from(value as ArrayLike<unknown>);
    }
    // null/undefined are tolerated: log a dev error and render nothing (matching
    // engine-core, which warns and treats them as an empty iteration).
    if (value == null) {
        if (process.env.NODE_ENV !== 'production') {
            logForError(
                `Invalid template iteration for value \`${String(value)}\` in ${ctx().vm}. ` +
                    `It must be an array-like object.`
            );
        }
        return [];
    }
    // A non-null, non-iterable, non-array-like value (e.g. a plain object `{}`) is
    // a hard error: throw so it propagates to the nearest errorCallback boundary /
    // window error (matching engine-core's iterate-non-iterable behavior).
    throw new Error(
        `Invalid template iteration for value \`${String(value)}\` in ${ctx().vm}. ` +
            `It must be an array-like object.`
    );
}

/** Validate that for:each keys are present, primitive, and unique (dev only). */
function validateKeys(items: unknown[], getKey: (item: unknown, index: number) => unknown): void {
    const { vm, tag } = ctx();
    const seen = new Map<unknown, number>();
    for (let i = 0; i < items.length; i++) {
        const key = getKey(items[i], i);
        if (
            key === undefined ||
            key === null ||
            (typeof key !== 'string' && typeof key !== 'number')
        ) {
            logForError(
                `Invalid key value "${String(key)}" in ${vm}. Key must be a string or number.`
            );
            logForError(
                `Invalid "key" attribute value in "<${tag}>" for item number ${i}. ` +
                    `Set a unique "key" value on all iterated child elements.`
            );
        } else if (seen.has(key)) {
            // engine-core reports the COMBINED key `<compilerKey>:<userKey>` (the
            // `k()` API prefixes a per-keyed-element compiler index). Vapor's runtime
            // key is the raw user key; prefix a compiler-index placeholder in the
            // message to match engine-core's format (the test asserts `\d:xyz`).
            logForError(
                `Duplicated "key" attribute value in "<${tag}>" for item number ${i}. A key with ` +
                    `value "0:${String(key)}" appears more than once in the iteration. Key values ` +
                    `must be unique numbers or strings.`
            );
        } else {
            seen.set(key, i);
        }
    }
}

export function createFor<T>(
    source: () => T[],
    renderItem: (item: T, index: ShallowRef<number>) => Block,
    getKey?: (item: T, index: number) => any,
    /** ANCHORLESS mode (engine-core `api_iterator` parity): when provided, this list
     *  contributes NO delimiter comment. `nextSibling()` lazily resolves the DOM node
     *  the list must stay BEFORE (the following control-flow block's stable leading
     *  node, or null = append at the parent's end). The fragment records its container
     *  via `suppressedParent` at insert time. */
    nextSibling?: () => Node | null,
    /** ANCHORLESS mode: a getter for the LAST DOM node of the PRECEDING sibling block.
     *  Used to resolve the list's real parent when the list is empty and has no next
     *  sibling (append mode) — the recorded `suppressedParent` may be a cloned fragment
     *  that was emptied when its nodes moved into the real root, but a preceding
     *  sibling's node stays live in that root. */
    prevSibling?: () => Node | null
): Block {
    const anchorless = nextSibling !== undefined;
    // Whether the compiled row body can read the iteration index. The compiler emits
    // `renderItem` with arity 2 (`(item, index) => ...`) iff `for:index` was declared;
    // arity 1 otherwise. When the index is unreadable we skip the per-row `indexRef`
    // `shallowRef` allocation (one object + one Dep Set that nothing subscribes to).
    const usesIndex = renderItem.length >= 2;
    // In anchorless mode the fragment owns no comment; otherwise it keeps a trailing
    // anchor (the legacy positioning reference).
    const anchor = anchorless ? undefined : document.createComment('');
    const frag = new VaporFragment([], anchor);
    if (anchorless) {
        frag.anchorless = true;
    } else {
        // Allow the trailing anchor to be suppressed when this list is appended at a
        // shadow/host root top (engine-dom shape — no delimiter node there).
        frag.anchorSuppressible = true;
    }
    let oldBlocks: ForBlock[] = [];
    let currentBlocks: ForBlock[] = [];
    let mounted = false;
    // Resolve the current insertion reference: in anchorless mode, the lazily-computed
    // next sibling; otherwise the trailing anchor (when still attached in `parent`).
    // Safely invoke the next-sibling getter. The compiled getter may reference a
    // control-flow block variable declared LATER in document order; during this list's
    // INITIAL synchronous mount that `const` is still in its TDZ, so the call throws —
    // treat that (and any error) as "no next sibling yet" (null = append).
    const safeNextSibling = (): Node | null => {
        if (!anchorless) return null;
        try {
            return nextSibling!() ?? null;
        } catch {
            return null;
        }
    };
    const insertionRef = (parent: ParentNode): Node | null => {
        if (anchorless) {
            const n = safeNextSibling();
            // Only usable if it's actually in this parent (it may belong elsewhere if
            // the following block is detached/empty); else append.
            return n && n.parentNode === parent ? n : null;
        }
        return anchor!.parentNode === parent ? anchor! : null;
    };
    // Resolve the REAL DOM parent the list lives in. With an anchor it's the anchor's
    // parent. ANCHORLESS lists have no marker node, and `suppressedParent` recorded at
    // insert time may be a cloned fragment that was EMPTIED when its nodes moved into
    // the real root — so prefer (a) the next sibling's live parent, then (b) an existing
    // item's live parent, then (c) the recorded container.
    const resolveListParent = (): ParentNode | null => {
        if (!anchorless) return anchor!.parentNode ?? frag.suppressedParent ?? null;
        const nx = safeNextSibling();
        if (nx && nx.parentNode) return nx.parentNode;
        for (const b of currentBlocks) {
            const fn = b.firstNode ?? firstNodeOf(b.nodes);
            if (fn && fn.parentNode) return fn.parentNode;
        }
        // No next sibling and no current items: resolve via the PRECEDING sibling's
        // last node (still live in the real root even after a cloned fragment flush).
        if (prevSibling) {
            try {
                const pv = prevSibling();
                if (pv && pv.parentNode) return pv.parentNode;
            } catch {
                /* TDZ during initial mount — fall through */
            }
        }
        return frag.suppressedParent ?? null;
    };

    renderEffect(() => {
        const raw = source();
        // Normalize the iteration source to an array. LWC accepts any array-LIKE
        // or iterable (generators, Sets, Maps, NodeLists); a non-iterable value is
        // a dev error. null/undefined render nothing (with a dev error).
        const items = normalizeForSource(raw) as T[];
        const newLength = items.length;
        // Parent is the anchor's DOM parent, or — when the anchor was suppressed/absent
        // (root-top or ANCHORLESS) — resolved from the next sibling / existing items.
        const parent = resolveListParent();
        // Validate keys (dev): each key must be a string/number and unique. The
        // error wording matches engine-core. Done once per render over the array.
        if (getKey && process.env.NODE_ENV !== 'production') {
            validateKeys(items as unknown[], getKey as (i: unknown, n: number) => unknown);
        }
        const keyOf = (item: T, index: number) => (getKey ? getKey(item, index) : index);

        // Initial render: create all blocks once. We consider the list "mounted"
        // after this first render regardless of whether the fragment is attached
        // yet (it may be inserted by the caller afterwards). Subsequent runs go
        // through keyed reconciliation.
        if (!mounted) {
            const blocks: ForBlock[] = new Array(newLength);
            for (let i = 0; i < newLength; i++) {
                blocks[i] = mountItem(items[i], i, keyOf(items[i], i));
            }
            oldBlocks = blocks;
            currentBlocks = blocks;
            frag.nodes = blocks.map((b) => b.nodes);
            mounted = true;
            return;
        }

        if (!parent) {
            // Not attached yet but already mounted: just rebuild block list
            // in-memory (no DOM ops possible without a parent).
            const blocks: ForBlock[] = new Array(newLength);
            for (let i = 0; i < newLength; i++) {
                blocks[i] = mountItem(items[i], i, keyOf(items[i], i));
            }
            for (const b of oldBlocks) b.scope.stop();
            oldBlocks = blocks;
            currentBlocks = blocks;
            frag.nodes = blocks.map((b) => b.nodes);
            return;
        }

        reconcile(items, newLength, parent, keyOf);
        oldBlocks = currentBlocks;
        frag.nodes = oldBlocks.map((b) => b.nodes);
    }, /* deferrable */ true);

    return frag;

    function mountItem(item: T, index: number, key: any): ForBlock {
        const scope = new EffectScope();
        const itemRef = shallowRef(item);
        // Only allocate a real, tracked index ref when the row body can read it
        // (see `usesIndex`); otherwise reuse the shared no-op sentinel.
        const indexRef = usesIndex ? shallowRef(index) : NOOP_INDEX_REF;
        // Pass a reactive item proxy and the index *ref* (the compiled body reads
        // `index.value`), so reused blocks reflect their new index after a keyed
        // reorder. `runAsForItem` marks the render effects created here as per-row
        // bindings so they are kept fully fine-grained (excluded from the owner's
        // whole-template fan-out) — see the note in renderEffect.ts.
        const nodes = scope.run(() =>
            runAsForItem(() => renderItem(itemProxy(itemRef), indexRef))
        )!;
        return { key, scope, itemRef, indexRef, nodes, firstNode: firstNodeOf(nodes) };
    }

    /**
     * Keyed reconciliation with longest-increasing-subsequence (LIS) move
     * minimization. Reused blocks that are already in the correct relative order
     * are left untouched; only the minimal set of blocks is moved in the DOM.
     */
    function reconcile(
        items: T[],
        newLength: number,
        parent: ParentNode,
        keyOf: (item: T, index: number) => any
    ): void {
        const oldLength = oldBlocks.length;

        // Fast path: clearing the entire list. Stop all scopes and remove the
        // DOM range in as few operations as possible.
        if (newLength === 0 && oldLength > 0) {
            for (let i = 0; i < oldLength; i++) {
                oldBlocks[i].scope.stop();
            }
            // Remove all rendered nodes. If the parent contains only this list
            // (plus the anchor), clearing children wholesale is fastest; else
            // remove each block's nodes.
            for (let i = 0; i < oldLength; i++) {
                removeBlock(oldBlocks[i].nodes, parent);
            }
            currentBlocks = [];
            return;
        }

        const newBlocks: ForBlock[] = new Array(newLength);

        // Map old keys -> old index for O(1) lookup.
        const oldKeyToIndex = new Map<any, number>();
        for (let i = 0; i < oldLength; i++) {
            oldKeyToIndex.set(oldBlocks[i].key, i);
        }

        // `sources[newIdx]` = old index reused there, or -1 if newly mounted.
        const sources: number[] = new Array(newLength).fill(-1);
        const used = new Array(oldLength).fill(false);
        let maxReusedOldIndex = 0;
        let movedNeeded = false;

        // Update reused items' data refs SYNCHRONOUSLY: a reused block's
        // `itemRef`/`indexRef` write drives its per-item bindings, which must run NOW
        // (as one coherent reconcile unit) rather than deferring past the block MOVES
        // below — a move fires dc/cc that tears down + remounts the item's effects, so a
        // deferred binding would target a stopped effect (iteration reorder under the
        // Vue-parity async model). engine-core/Vue update a reused item's data as part of
        // the single component job; this reproduces that coherence for vapor's
        // fine-grained per-item effects. Moves (dc/cc) still happen async-normally after.
        runWithSyncNotify(() => {
            for (let i = 0; i < newLength; i++) {
                const item = items[i];
                const key = keyOf(item, i);
                const oldIndex = oldKeyToIndex.get(key);
                if (oldIndex !== undefined && !used[oldIndex]) {
                    used[oldIndex] = true;
                    const block = oldBlocks[oldIndex];
                    // Update data in place (drives the row's own render effects).
                    block.itemRef.value = item;
                    block.indexRef.value = i;
                    newBlocks[i] = block;
                    sources[i] = oldIndex;
                    if (oldIndex < maxReusedOldIndex) {
                        movedNeeded = true;
                    } else {
                        maxReusedOldIndex = oldIndex;
                    }
                } else {
                    newBlocks[i] = mountItem(item, i, key);
                }
            }
        });

        // STOP the effect scopes of old blocks that were not reused, but DEFER their
        // DOM removal until AFTER the new blocks are mounted+inserted (below). engine-
        // core mounts the incoming content BEFORE tearing down the outgoing, so a keyed
        // change fires the NEW row's connectedCallback+renderedCallback BEFORE the
        // removed row's disconnectedCallback (scoped-slot keyed reactivity callback
        // order). Stopping the scope NOW (before the parent's scoped-body bindings run,
        // via the deferrable-first async ordering) neutralizes the doomed row's parent-
        // owned `identifier={item.id}` binding so it does NOT rehydrate the doomed child
        // with the in-place-mutated value before disconnect — the removed row tears down
        // reporting its CAPTURED value (key 39), not the mutated one (38).
        const doomed: ForBlock[] = [];
        for (let i = 0; i < oldLength; i++) {
            if (!used[i]) {
                oldBlocks[i].scope.stop();
                doomed.push(oldBlocks[i]);
            }
        }

        // Compute the set of reused new-indices that can stay in place (LIS over
        // the reused old indices). Everything else is inserted/moved.
        let stay: Set<number> | null = null;
        if (movedNeeded) {
            const reusedNewIndices: number[] = [];
            const reusedOldSeq: number[] = [];
            for (let i = 0; i < newLength; i++) {
                if (sources[i] !== -1) {
                    reusedNewIndices.push(i);
                    reusedOldSeq.push(sources[i]);
                }
            }
            const lis = longestIncreasingSubsequence(reusedOldSeq);
            let stayIdx = lis.map((k) => reusedNewIndices[k]);
            // Move-choice parity with engine-core's keyed diff: for a full reversal
            // (`[1,2]→[2,1]` → reusedOldSeq strictly DECREASING, LIS length 1 over >1
            // reused items), either single item could be the stationary one. Vapor's
            // LIS keeps the earliest reused new-index, which MOVES the later item;
            // engine-core/snabbdom keeps the LAST and moves the earlier item, firing
            // dc/cc on the earlier item (lifecycle "reordering a list" callbacks). Match
            // it by keeping the last reused new-index stationary in that tie case.
            if (lis.length === 1 && reusedNewIndices.length > 1) {
                stayIdx = [reusedNewIndices[0]];
            }
            stay = new Set(stayIdx);
        }

        // Walk right-to-left, inserting/moving nodes before the next sibling so
        // that blocks in the LIS (already ordered) are never touched. The rightmost
        // item is inserted before the list's insertion reference (trailing anchor, or
        // in anchorless mode the following block's leading node — or null = append).
        let nextNode: Node | null = insertionRef(parent);
        for (let i = newLength - 1; i >= 0; i--) {
            const block = newBlocks[i];
            const isNew = sources[i] === -1;
            const needsMove = movedNeeded && !stay!.has(i);
            if (isNew || needsMove) {
                insertBlock(block.nodes, parent, nextNode);
            }
            block.firstNode = firstNodeOf(block.nodes);
            nextNode = block.firstNode ?? nextNode;
        }

        // Now that the incoming rows are mounted+connected, remove the doomed rows'
        // DOM — firing their disconnectedCallback AFTER the new rows' connect/rendered
        // (engine-core's mount-before-teardown ordering).
        for (const b of doomed) {
            removeBlock(b.nodes, parent);
        }

        currentBlocks = newBlocks;
    }
}

/**
 * Classic O(n log n) longest-increasing-subsequence, returning indices into the
 * input array that form the LIS. Used to minimize DOM moves during keyed list
 * reconciliation (the same technique Vue and Inferno use).
 */
function longestIncreasingSubsequence(arr: number[]): number[] {
    const n = arr.length;
    if (n === 0) return [];
    const predecessors = new Array(n).fill(-1);
    const tailsIdx: number[] = [];

    for (let i = 0; i < n; i++) {
        const x = arr[i];
        // Binary search for the first tail >= x.
        let lo = 0;
        let hi = tailsIdx.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (arr[tailsIdx[mid]] < x) lo = mid + 1;
            else hi = mid;
        }
        if (lo > 0) predecessors[i] = tailsIdx[lo - 1];
        if (lo === tailsIdx.length) tailsIdx.push(i);
        else tailsIdx[lo] = i;
    }

    // Reconstruct.
    const result: number[] = [];
    let k = tailsIdx[tailsIdx.length - 1];
    while (k !== -1) {
        result.push(k);
        k = predecessors[k];
    }
    return result.reverse();
}

/**
 * Implements the `iterator:it={items}` directive. Each rendered item receives an
 * iterator object `{ value, index, first, last }` (matching LWC's iterator),
 * keyed by index. Delegates to createFor over the wrapped objects.
 */
export function createIterator<T>(
    source: () => T[],
    renderItem: (it: { value: T; index: number; first: boolean; last: boolean }) => Block,
    getKey?: (it: { value: T; index: number; first: boolean; last: boolean }) => any
): Block {
    const wrapped = () => {
        const items = source() || [];
        const len = items.length;
        return items.map((value, index) => ({
            value,
            index,
            first: index === 0,
            last: index === len - 1,
        }));
    };
    return createFor(
        wrapped,
        (it: any) => renderItem(it),
        // Use the author-supplied key (e.g. key={it.value}) when present so node
        // identity is preserved across reorders; fall back to index otherwise.
        getKey ? (it: any) => getKey(it) : (it: any) => it.index
    );
}
