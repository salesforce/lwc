/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { type Block, DynamicFragment } from './block';
import { renderEffect, getCurrentOwner, setCurrentCoOwner } from './renderEffect';
import { trackAccess, triggerUpdate } from './reactivity';

// Reactive "slot-attr epoch": bumped whenever a forwarded node's `slot` attribute
// changes (setProp('slot') / retagSlot). A light component's REORDER effect
// subscribes to it, so when forwarded content is retagged up the chain the terminal
// light component regroups its slotted children into slot-declaration order — the
// multi-level forwarding case where intermediate DynamicFragments are flattened away
// and can no longer relocate the node themselves (slot-forwarding reactivity).
const slotAttrEpoch: Record<string, number> = { v: 0 };
export function notifySlotAttrChanged(): void {
    slotAttrEpoch.v++;
    triggerUpdate(slotAttrEpoch, 'v');
}
function trackSlotAttrEpoch(): void {
    trackAccess(slotAttrEpoch, 'v');
}

// Reactive "slot-membership epoch": bumped by `createIf` when a conditional inside
// slot content TOGGLES (inserts/removes a node). Distinct from `slotAttrEpoch` on
// purpose — a conditional toggle is frequent and mostly unrelated to slots, so it
// must NOT drive the terminal `reorderLightSlots` (which subscribes to slotAttrEpoch
// and does destructive appendChild moves). Only a FORWARDING `<slot>`'s re-tag effect
// subscribes here: it re-tags late-inserted authored content, and — only if that
// actually changes an attribute — its `retagSlot` then bumps slotAttrEpoch to drive
// the reorder. This keeps unrelated conditional toggles from perturbing slotted DOM.
const slotMembershipEpoch: Record<string, number> = { v: 0 };
export function notifySlotMembershipChanged(): void {
    slotMembershipEpoch.v++;
    triggerUpdate(slotMembershipEpoch, 'v');
}
function trackSlotMembershipEpoch(): void {
    trackAccess(slotMembershipEpoch, 'v');
}

// Stack of ENCLOSING standard-slot anchors currently rendering their body. A nested
// slot (multi-level forwarding: a MID-level `<slot>` whose content is rendered inside a
// terminal leaf's `<slot>` body) captures the nearest enclosing slot's trailing anchor
// as a DURABLE insertion point for its empty-assigned fallback holder. The mid's OWN
// bookends get stripped by the terminal leaf's post-mount `flattenSlotFrags` (they are
// `__slotFrag`-tagged and sit between the leaf slot's own pair), so a reactive holder
// fill can no longer position against them — but the terminal leaf slot's own anchor
// survives the flatten (the walk keeps the outermost pair), giving a stable target.
const slotBodyAnchorStack: Array<() => Node | null> = [];

// Per light-component `<slot>` NAME order (declaration order), keyed by host element,
// for the reactive reorder.
const lightSlotOrder = new WeakMap<object, string[]>();
export function registerLightSlotName(host: object, name: string): void {
    let order = lightSlotOrder.get(host);
    if (!order) lightSlotOrder.set(host, (order = []));
    if (!order.includes(name)) order.push(name);
}

/** Declaration-order index of a slot NAME within a light host's `<slot>` set (the order
 *  they were registered / rendered). Used by the ordered-disconnect to sequence a
 *  slottable's NAMED-slot velements in slot-declaration order (walked reverse), matching
 *  engine-core's velements array (populated as `<slot>` vnodes render). Returns a large
 *  sentinel for an unknown host/name so unranked entries sort last. */
export function getLightSlotDeclRank(host: object, name: string): number {
    const order = lightSlotOrder.get(host);
    if (!order) return Number.MAX_SAFE_INTEGER;
    const i = order.indexOf(name);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

// Hook to resolve the host of the light component currently rendering a `<slot>`.
let currentLightHost: (() => HTMLElement | null) | null = null;
export function setCurrentLightHostResolver(fn: () => HTMLElement | null): void {
    currentLightHost = fn;
}

// Reactively regroup a light component's slotted content so that, in document order,
// children follow the component's `<slot>` declaration order grouped by each child's
// CURRENT `slot` attribute. Runs on the slot-attr epoch. Handles multi-level
// forwarding where a retag up the chain changed a node's slot but the (flattened)
// intermediate fragments couldn't relocate it. Stable within a slot group.
export function reorderLightSlots(host: HTMLElement): void {
    trackSlotAttrEpoch();
    const order = lightSlotOrder.get(host);
    if (!order || order.length < 2) return;
    const rank = (el: Element): number => {
        // Rank by the node's GATHER NAME (which terminal-leaf `<slot name=X>` owns it),
        // stamped during forwarding retag — this is stable under a leaf's own slot
        // retarget (step 4), where the live `slot=` attribute no longer reflects the
        // gathering slot. Fall back to the live attribute for un-stamped content.
        const s = (el as { __gname?: string }).__gname ?? el.getAttribute('slot') ?? '';
        const i = order.indexOf(s);
        return i === -1 ? order.length : i;
    };
    // Only reorder ELEMENT children that carry a slot assignment we know about (or the
    // default ''); leave structural/comment nodes and unknown elements in place by
    // sorting stably. Operate on direct element children of the host.
    const kids = Array.from(host.children);
    if (kids.length < 2) return;
    let needs = false;
    for (let i = 1; i < kids.length; i++) {
        if (rank(kids[i]) < rank(kids[i - 1])) {
            needs = true;
            break;
        }
    }
    if (!needs) return;
    const sorted = kids
        .map((el, i) => ({ el, i }))
        .sort((a, b) => rank(a.el) - rank(b.el) || a.i - b.i)
        .map((x) => x.el);
    // appendChild on an already-connected native custom element is a MOVE → the browser
    // fires a native disconnect+connect reaction per moved element (spurious dc/cc pairs
    // at mount, since the slotees can reverse to ranks [2,1,0]). `moveBefore` is an ATOMIC
    // move that does NOT fire disconnect/connect. Falls back to appendChild when
    // unavailable or for a not-yet-connected node.
    const canMove = typeof (host as { moveBefore?: unknown }).moveBefore === 'function';
    for (const el of sorted) {
        if (canMove && el.isConnected) {
            try {
                (host as unknown as { moveBefore(n: Node, ref: Node | null): void }).moveBefore(
                    el,
                    null
                );
                continue;
            } catch {
                // fall through to appendChild
            }
        }
        host.appendChild(el);
    }
}

// Per-batch snapshot of a content-parent's `slot=` membership, captured on the FIRST
// light-mid forwarding retag of a microtask flush and cleared on the next microtask.
// Multi-level light-DOM forwarding: when several sibling forwarding `<slot slot={expr}>`
// retarget in one tick, each must remap the node that CURRENTLY carries its declared
// name (the container-assigned `slot=`), not its own stale `frag.nodes` (which was
// pinned at first resolution and never re-resolved when the container redistributed).
// Snapshotting the membership ONCE, before any retag mutates it, keeps the sibling
// remaps from stomping each other. Keyed by the live content parent element.
let retagMembership = new WeakMap<Element, Map<string, Element[]>>();
let retagClearArmed = false;
function membershipBucket(parent: Element, name: string): Element[] | undefined {
    let snap = retagMembership.get(parent);
    if (!snap) {
        snap = new Map();
        for (const el of Array.from(parent.children)) {
            const s = el.getAttribute('slot') ?? '';
            let arr = snap.get(s);
            if (!arr) snap.set(s, (arr = []));
            arr.push(el);
        }
        retagMembership.set(parent, snap);
        if (!retagClearArmed) {
            retagClearArmed = true;
            queueMicrotask(() => {
                retagMembership = new WeakMap();
                retagClearArmed = false;
            });
        }
    }
    return snap.get(name);
}

/** Count the "real" (content-producing) nodes a rendered block currently occupies:
 *  element nodes and non-empty text nodes, recursing through arrays, fragments, and
 *  child-component blocks. Comment/bookend nodes are NOT counted. Used to decide, on
 *  the slot-membership epoch, whether a slot's ASSIGNED content flattened to zero real
 *  nodes (a forwarded slot whose source `lwc:if` is false) so its FALLBACK must show —
 *  engine-core renders a `<slot>`'s default content when no assigned content lands. */
function countRealNodes(block: Block): number {
    if (block == null) return 0;
    if (block instanceof Node) {
        if (block.nodeType === 1 /* Element */) return 1;
        if (block.nodeType === 3 /* Text */) return (block.textContent?.length ?? 0) > 0 ? 1 : 0;
        return 0; // comments/bookends contribute nothing
    }
    if (Array.isArray(block)) {
        let n = 0;
        for (const b of block) n += countRealNodes(b);
        return n;
    }
    if (block && typeof block === 'object') {
        if ('nodes' in (block as object)) return countRealNodes((block as { nodes: Block }).nodes);
        if ('block' in (block as object)) {
            const b = (block as { block?: Block }).block;
            return b == null ? 0 : countRealNodes(b);
        }
    }
    return 0;
}

/** First element node within a rendered block (skips comments/text/nested frags). */
function firstElementIn(block: Block): Element | null {
    let found: Element | null = null;
    const visit = (x: unknown): void => {
        if (found) return;
        if (x instanceof Node) {
            if (x.nodeType === 1) found = x as Element;
        } else if (Array.isArray(x)) {
            x.forEach(visit);
        } else if (x && typeof x === 'object' && 'nodes' in (x as object)) {
            visit((x as { nodes: unknown }).nodes);
        }
    };
    visit(block);
    return found;
}

/** Re-derive the terminal leaf host that currently parents a forwarding slot's
 *  occupants, used when `frag.nodes` went stale because a LIGHT-component slotee was
 *  recreated (insertBefore/removeChild swaps the node the frag still references).
 *
 *  Walks `lightHost`'s rendered light DOM breadth-first for the deepest element that
 *  directly parents element children carrying a `slot=`/`__gname` membership — that is
 *  the leaf host into which the forwarded content lands. Preference is given to a parent
 *  that owns the requested `name` bucket, else any parent holding stamped occupants. */
function deriveLeafHost(lightHost: Element, name: string): Element | null {
    let best: Element | null = null;
    const queue: Element[] = [lightHost];
    while (queue.length) {
        const el = queue.shift()!;
        for (const child of Array.from(el.children)) {
            queue.push(child);
            const g = (child as { __gname?: string }).__gname;
            const s = g ?? child.getAttribute('slot') ?? undefined;
            if (s !== undefined) {
                // `el` directly parents a stamped occupant → candidate leaf host.
                if (s === name) return el; // exact bucket match wins immediately
                if (!best) best = el;
            }
        }
    }
    return best;
}

/** Marker for a slot-content fn that came from a `<template lwc:slot-data>` (a
 *  SCOPED slot), so the runtime can detect a parent/child slot-type mismatch. */
type SlotFn = ((data?: unknown) => Block) & { scoped?: boolean };

export function scopedSlot(fn: (data?: unknown) => Block): SlotFn {
    (fn as SlotFn).scoped = true;
    return fn;
}

/** A DynamicFragment carrying a DEFERRED scoped-slot factory. */
type ScopedFragment = DynamicFragment & {
    __scopedSlot?: boolean;
    __scopedFactory?: (data?: unknown) => Block;
    __scopedFilled?: boolean;
};

/**
 * Runtime marker for PER-BRANCH scoped slot content: a `<template lwc:slot-data>` that
 * appears inside an lwc:if/elseif/else branch of a component's slot content. Unlike a
 * statically-scoped slot fn (`scopedSlot(...)`, whose `.scoped` flag is fixed), a `""`
 * slot fn can be scoped in ONE branch and standard in another — engine-core resolves
 * scopedness per PRODUCED vnode. `scopedSlotFragment(factory)` is emitted by codegen as
 * the branch's return.
 *
 * The factory is NOT invoked eagerly. A parent's `<template lwc:if>` wrapping the
 * scoped content compiles to a persistent reactive `createIf` whose renderEffect
 * re-runs when its condition flips — INDEPENDENTLY of any `<slot>` consuming it (and
 * possibly BEFORE a stale branch is torn down). Invoking the factory there would read
 * `data` (the child slot's bound value), which only exists when the CHILD's scoped
 * `<slot>` pulls the content (engine-core's `api_scoped_slot_factory`: the child invokes
 * the parent factory with the resolved data). So we produce an EMPTY DynamicFragment
 * TAGGED `__scopedSlot` with the factory STORED on it; `fillScopedFragments` (called by
 * createSlot with the real data) invokes the factory into the fragment. A stale/unconsumed
 * scopedSlotFragment simply stays empty — no throw on `data.id`.
 */
export function scopedSlotFragment(factory: (data?: unknown) => Block): Block {
    const frag = new DynamicFragment() as ScopedFragment;
    frag.__scopedSlot = true;
    frag.__scopedFactory = factory;
    // The scoped-slot content marker contributes NO bookends of its own: the receiving
    // scoped `<slot>`'s own `createSlot` fragment provides the single wrapping pair, and
    // the child's inner `lwc:if` (the elseif that selected the scoped branch) provides
    // the extra pair the scoped case expects. Bracketing here too would leak a spurious
    // pair (scoped-slot if-block: 4 bookend pairs instead of the expected 3). Anchorless
    // + noBookends means `insertBlock` inserts only the produced content.
    frag.anchorlessIf = true;
    frag.noBookends = true;
    return frag;
}

/** Walk a produced slot-content block, invoking every deferred `scopedSlotFragment`'s
 *  stored factory with `data` (the child slot's bound value). Idempotent per fragment
 *  via `__scopedFilled` so a re-render doesn't double-fill. Called by createSlot after
 *  it produces scoped content, so the factory runs with the CORRECT bound data (matching
 *  engine-core, where the child's `<slot>` invokes the parent's scoped-slot factory). */
function fillScopedFragments(block: Block, data: unknown): void {
    if (block == null || block instanceof Node) return;
    const sf = block as ScopedFragment;
    if (sf.__scopedSlot && sf.__scopedFactory) {
        const factory = sf.__scopedFactory;
        sf.update(() => factory(data), data);
        sf.__scopedFilled = true;
        return;
    }
    if (Array.isArray(block)) {
        for (const b of block) fillScopedFragments(b, data);
        return;
    }
    if (block && typeof block === 'object' && 'nodes' in (block as object)) {
        fillScopedFragments((block as { nodes: Block }).nodes, data);
        return;
    }
    if (block && typeof block === 'object' && 'block' in (block as object)) {
        const b = (block as { block?: Block }).block;
        if (b != null) fillScopedFragments(b, data);
    }
}

/** Synchronous probe: does a produced slot-content block contain a per-branch
 *  `scopedSlotFragment` marker (recursing through arrays and DynamicFragments' current
 *  content)? Used by createSlot to derive scopedness of the PRODUCED content. */
function containsScopedFragment(block: Block): boolean {
    if (block == null || block instanceof Node) return false;
    if ((block as { __scopedSlot?: boolean }).__scopedSlot) return true;
    if (Array.isArray(block)) {
        for (const b of block) if (containsScopedFragment(b)) return true;
        return false;
    }
    if (block && typeof block === 'object' && 'nodes' in (block as object)) {
        return containsScopedFragment((block as { nodes: Block }).nodes);
    }
    if (block && typeof block === 'object' && 'block' in (block as object)) {
        const b = (block as { block?: Block }).block;
        return b == null ? false : containsScopedFragment(b);
    }
    return false;
}

/**
 * Resolve a `<slot name>`'s content fn from a slotset's `$dynamic` array (children
 * authored `slot={expr}`): the FIRST entry whose name getter resolves to `name`. If
 * several entries resolve to the same name, they combine into one fn returning their
 * blocks in order. Returns undefined when there is no matching dynamic entry. (A
 * null/undefined name → the default slot, '').
 */
function resolveDynamicSlotFn(
    slotset: Record<string, SlotFn> | undefined,
    name: string
): SlotFn | undefined {
    const dyn = slotset && (slotset as unknown as Record<string, unknown>)['$dynamic'];
    if (!Array.isArray(dyn)) return undefined;
    const matches: SlotFn[] = [];
    for (const entry of dyn as Array<{ name: () => unknown; fn: SlotFn }>) {
        let resolved: string;
        try {
            const v = entry.name();
            resolved = v == null ? '' : String(v);
        } catch {
            resolved = '';
        }
        if (resolved === name) matches.push(entry.fn);
    }
    if (matches.length === 0) return undefined;
    if (matches.length === 1) return matches[0];
    const combined = ((data?: unknown) => matches.map((f) => f(data))) as SlotFn;
    if (matches[0].scoped) combined.scoped = true;
    return combined;
}

let logSlotError: ((msg: string) => void) | null = null;
export function setLogSlotError(fn: (msg: string) => void): void {
    logSlotError = fn;
}

/** Set `slot="value"` on the top-level Element nodes of a rendered block (used by
 *  forwarding `<slot slot="value">` to re-tag its resolved content). When `forwarding`
 *  is true, an empty value is set as `slot=""` (present-but-empty) rather than removed:
 *  a FORWARDING slot with an empty resolved target (`slot={x}` where x==='') keeps the
 *  empty attribute to mark the content as distributed-via-forwarding (api>=61,
 *  USE_LIGHT_DOM_SLOT_FORWARDING). A TERMINAL slot removes the attribute (content has
 *  landed in its final slot). */
function retagSlot(block: Block, value: string, forwarding = false): void {
    if (block instanceof Node) {
        if (block.nodeType === 1) {
            const el = block as Element;
            const cur = el.getAttribute('slot');
            const next = value === '' && !forwarding ? null : value;
            if (cur !== next) {
                if (next === null) el.removeAttribute('slot');
                else el.setAttribute('slot', next);
                // A forwarding retag that changed a node's slot must trigger the
                // terminal reorder (multi-level forwarding: mid-level `slot={expr}`
                // retarget), same as a direct setProp('slot') change.
                notifySlotAttrChanged();
            }
        }
    } else if (Array.isArray(block)) {
        for (const b of block) retagSlot(b, value, forwarding);
    } else if (block && typeof block === 'object' && 'nodes' in block) {
        // VaporFragment / DynamicFragment
        retagSlot((block as { nodes: Block }).nodes, value, forwarding);
    }
}

function reportMismatch(name: string): void {
    const slotLabel = name === '' ? '(default)' : name;
    logSlotError?.(
        `Mismatched slot types for ${slotLabel} slot. Both parent and child ` +
            `component must use standard type or scoped type for a given slot.`
    );
}

// Hook (wired by the compat layer): recreate a LIGHT child-component host that a
// FORWARDING slot just retargeted to a different slot bucket. engine-core's keyed
// light-DOM slot diff unmounts the old slotee and mounts a fresh instance on such a
// move; vapor's retag-in-place repositions the same instance. When the retagged
// element is a light component host (carries the recreate factory), route it through
// here to reproduce the recreate lifecycle. Returns the NEW host if it recreated (so
// the caller can re-stamp `__gname`), else null (a plain element / non-recreatable
// host — reposition in place as before). MUST be a no-op for plain `<p>` forwarding
// (reactivity spec repositions plain nodes in place).
let recreateForwardedSlotee: ((el: Element, nextSlot: string) => Element | null) | null = null;
export function setRecreateForwardedSlotee(
    fn: (el: Element, nextSlot: string) => Element | null
): void {
    recreateForwardedSlotee = fn;
}

// Post-mount hook (wired by the compat layer): registers a STANDARD slot's
// DynamicFragment so that, once the host is fully mounted and its DOM assembled,
// the runtime can FLATTEN nested fragment bookends inside the slot's resolved
// content (engine-core's `flattenFragmentsInChildren`) — leaving only the slot's
// own start/anchor pair. Done post-mount because the slot content is inserted into
// the DOM AFTER the slot fragment itself (so an inline flatten sees no parent yet).
let registerSlotForFlatten: ((frag: DynamicFragment) => void) | null = null;
export function setRegisterSlotForFlatten(fn: (frag: DynamicFragment) => void): void {
    registerSlotForFlatten = fn;
}

// Hook (wired by the compat layer): records that a block of slot content was
// distributed into the NAMED slot `name` of the slottable that owns this `<slot>`
// (the current owner). The compat layer uses this on disconnect to classify a
// named-slot slotted child as a velement of the slottable (engine-core parity:
// named-slot children disconnect in reverse BEFORE default-slot children forward).
let recordSlotAssignment: ((block: Block, name: string) => void) | null = null;
export function setRecordSlotAssignment(fn: (block: Block, name: string) => void): void {
    recordSlotAssignment = fn;
}

export function createSlot(
    name: string,
    slotset: Record<string, SlotFn> | undefined,
    fallback?: () => Block,
    bindGetter?: () => unknown,
    forwardAs?: string | (() => unknown)
): Block {
    const frag = new DynamicFragment();
    // Previous forward target, to detect when only the target changed (frag.update
    // no-ops → re-tag mounted content in place; forwarding-reactivity step 3).
    let prevFwd: string | null | undefined;
    // EMPTY-ASSIGNED FALLBACK (engine-core parity: a `<slot>` renders its default
    // content when NO assigned content lands). A forwarded slot whose source is a
    // conditional (`<template lwc:if>`) has a truthy-but-empty slotFn — the assigned
    // content flattens to ZERO real nodes when the conditional is false, yet the
    // `if (slotFn)` branch below rendered it (empty) instead of the fallback. We keep
    // the assigned content ALWAYS mounted (it self-empties via its own internal
    // createIf) and ADD a bookend-less fallback holder as a sibling, toggled reactively
    // by whether the assigned content currently has any real nodes. This composes up a
    // forwarding chain BY REFERENCE: a mid-level slot's own fallback fills its fragment,
    // which the terminal leaf then counts as real content (so the leaf shows the mid's
    // fallback, not its own) — matching the multi-level forwarding expected DOM. Only
    // engaged for a STANDARD, NON-forwarding slot that DECLARES fallback content (limits
    // blast radius to exactly the slots that can need it).
    let assignedBlock: Block | undefined;
    let fallbackHolder: DynamicFragment | undefined;
    let fallbackShowing = false;
    // Tag this slot fragment's OWN bookends so the post-mount flatten can tell them
    // apart from the nested content fragments' bookends (which it strips).
    (frag.start as { __slotFrag?: boolean }).__slotFrag = true;
    (frag.anchor as { __slotFrag?: boolean }).__slotFrag = true;
    // The component hosting this <slot> (the CHILD) is the current owner now. Slot
    // CONTENT effects are owned by the PARENT (bindSlotsetOwner), but the content
    // lives in the child's subtree — so the child must ALSO get a renderedCallback
    // when the slot body re-renders. Record the child as the co-owner for the body.
    const childOwner = getCurrentOwner();

    // Whether THIS `<slot>` is a scoped slot (declared with `lwc:slot-bind`).
    const isScopedSlot = bindGetter !== undefined;

    // Tag the fragment (not the DOM nodes) with its slot NAME and whether it FORWARDS,
    // so the post-mount flatten can re-split non-reassignable content. A forwarding
    // `<slot slot="X">` re-tags only ELEMENTS (text/comment nodes carry no `slot`
    // attribute), so forwarded text/comment ride into slot X — but engine-core
    // distributes them to the DEFAULT slot (a native shadow leaf splits them via
    // `<slot>` projection; a light leaf's key-based createSlot distribution does not).
    // flattenSlotFrags re-splits them into this instance's default-slot region.
    (frag as { __slotName?: string }).__slotName = name;
    (frag as { __forwarding?: boolean }).__forwarding = !isScopedSlot && forwardAs !== undefined;

    // For a DYNAMIC forwarding slot (`<slot slot={expr}>`), ALSO tag the bookend COMMENT
    // NODES as forwarding. When a terminal light leaf runs flattenSlotFrags, its walk
    // strips every nested `__slotFrag` comment between a leaf slot's own start/anchor —
    // which includes this forwarding slot's bookends (they sit inside the leaf region).
    // Stripping them detaches this forwarding DynamicFragment's anchor → on a later
    // `slot={expr}` re-resolve, `DynamicFragment.update` sees `anchor.parentNode === null`
    // and both insertBlock/removeBlock are guarded off → the recreate is DOM-inert (no
    // connect/disconnect fires). Marking the nodes `__forwarding` keeps them in the DOM
    // (see flattenSlotFrags), so the recreate stays DOM-live. NARROWED to DYNAMIC
    // (function) forwardAs: a static `slot="x"` forwarding slot never re-resolves, so
    // leaving its strip behavior unchanged minimizes regression blast radius.
    const isDynForwarding = !isScopedSlot && typeof forwardAs === 'function';
    if (isDynForwarding) {
        (frag.start as { __forwarding?: boolean }).__forwarding = true;
        (frag.anchor as { __forwarding?: boolean }).__forwarding = true;
    }

    // Record this slot's name in the light host's slot-declaration order (reactive
    // reorder groups forwarded content by slot name). Capture the light host: a LIGHT
    // mid's forwarding retag must operate on the node CURRENTLY in this slot's bucket
    // (see membershipBucket), not the mid's stale frag.nodes.
    let lightHost: HTMLElement | null = null;
    if (currentLightHost) {
        lightHost = currentLightHost();
        if (lightHost) registerLightSlotName(lightHost, name);
    }

    // Durable cache of the LEAF host (the live parent element that physically holds this
    // forwarding slot's content). The retag path finds it via `firstElementIn(frag.nodes)`,
    // but a LIGHT-component slotee RECREATE (setRecreateForwardedSlotee) replaces those
    // nodes, leaving `frag.nodes` stale and detached. Cache the parent element the FIRST
    // time it resolves so a later retarget (leaf-level mutation) can still find the live
    // leaf and remap the CURRENT bucket occupants.
    let cachedLeafHost: Element | null = null;
    const resolveContentParent = (): Element | null => {
        if (!lightHost) return null;
        const firstEl = firstElementIn(frag.nodes);
        const live = firstEl?.parentElement ?? null;
        if (live) {
            cachedLeafHost = live;
            return live;
        }
        // frag.nodes went stale (a LIGHT-component slotee recreate replaced the nodes).
        // Reuse the cached leaf host if still attached; else re-derive it by walking the
        // mid host's rendered light DOM for the innermost element that currently holds
        // this slot's bucket occupants (the terminal leaf host). This keeps the forwarding
        // retarget (leaf-level mutation) live across a recreate.
        if (cachedLeafHost && cachedLeafHost.isConnected) return cachedLeafHost;
        const derived = deriveLeafHost(lightHost, name);
        if (derived) cachedLeafHost = derived;
        return derived;
    };

    // A STANDARD, NON-forwarding `<slot>` that DECLARES fallback content is eligible for
    // the empty-assigned fallback: its assigned content may flatten to zero real nodes
    // (a forwarded conditional resolving false) even though its slotFn is truthy. A
    // FORWARDING slot is deliberately EXCLUDED — it must forward its emptiness up the
    // chain (so the terminal slot's fallback shows, not an intermediate's), which is
    // exactly what leaving its holder unfilled achieves.
    const eligibleFallback = !isScopedSlot && forwardAs === undefined && fallback !== undefined;

    renderEffect(() => {
        // Resolve the content fn for this slot name. Content can arrive via BOTH a
        // static slotset entry (`<p slot="upper">`) AND dynamic `slot={expr}` entries
        // ($dynamic) whose name getter resolves to this name — engine-core distributes
        // by the resolved `slot` attribute and includes ALL matches. A static entry
        // that is currently EMPTY (a conditional `<p slot="upper" if:false>` compiles to
        // a truthy-but-empty static "upper" fn) must NOT shadow dynamic-forwarded content
        // of the same name (multi-level light-dom forwarding: the forwarded `slot={upper}`
        // content was dropped because an empty conditional `slot="upper"` entry existed).
        // COMBINE both rather than `??` (which let the empty static win).
        const staticFn = slotset?.[name];
        const dynamicFn = resolveDynamicSlotFn(slotset, name);
        let slotFn: SlotFn | undefined;
        if (staticFn && dynamicFn) {
            const combined = ((d?: unknown) => [staticFn(d), dynamicFn(d)]) as SlotFn;
            if ((staticFn as SlotFn).scoped) combined.scoped = true;
            slotFn = combined;
        } else {
            slotFn = staticFn ?? dynamicFn;
        }
        // Slot-type mismatch (engine-core): a SCOPED `<slot>` must receive SCOPED
        // content, and a STANDARD `<slot>` must receive STANDARD content. Scopedness of
        // the content is a property of the PRODUCED content (per branch), not a static
        // per-slot-fn flag: a `""` slot fn can be scoped in one lwc:if branch (a nested
        // `<template lwc:slot-data>` → `scopedSlotFragment` marker) and standard in
        // another. FAST PATH: a statically-tagged `scopedSlot(...)` fn (non-conditional
        // scoped content — runtime-checks) is known scoped WITHOUT invoking, so a
        // static-vs-standard mismatch is caught here (render nothing, report once). The
        // DYNAMIC path (a non-statically-scoped fn) is resolved INSIDE the body below by
        // probing the produced content — where the mismatch (either direction) reports
        // and renders nothing.
        const staticScoped = Boolean(slotFn && (slotFn as SlotFn).scoped);
        if (slotFn && staticScoped && !isScopedSlot) {
            reportMismatch(name);
            frag.update(undefined);
            return;
        }
        // Scoped slots: read the bound data (reactively) and pass it to the slot
        // content fn. The data is read here so the slot re-renders when it changes.
        const data = bindGetter ? bindGetter() : undefined;
        // Read the forward TARGET here in the effect body (not only inside the
        // frag.update render callback) so the effect subscribes to it and re-runs when
        // it changes — even when the resolved CONTENT is unchanged (a mid-level
        // `slot={expr}` retarget: forwarding-reactivity step 3). Then the retag fires
        // (below / in body) → notifySlotAttrChanged → terminal reorder repositions.
        const fwdTag =
            !isScopedSlot && forwardAs !== undefined
                ? typeof forwardAs === 'function'
                    ? (forwardAs() as string | null)
                    : forwardAs
                : undefined;
        // Record whether this slot currently shows ASSIGNED content (vs its own
        // fallback / nothing). The post-mount flatten only re-splits text/comment out of
        // a named slot that received ASSIGNED content — a slot rendering its OWN fallback
        // text (e.g. `<slot name=foo>fallback for foo</slot>` with nothing assigned) must
        // keep that text in place.
        (frag as { __assigned?: boolean }).__assigned = Boolean(slotFn);
        if (slotFn) {
            // Render the slot body with the child as co-owner so both parent + child
            // renderedCallbacks fire. SCOPED slots wrap the content in its OWN nested
            // DynamicFragment so it carries its own start/end `<!---->` bookends
            // (matching engine-core, which brackets each scoped-slot-content
            // invocation). STANDARD (forwarding) slots render the content directly —
            // their bookends come from the outer fragment / resolveLightDomSlots.
            const body = () => {
                const prevCo = setCurrentCoOwner(childOwner);
                // Expose THIS slot's trailing anchor as the enclosing durable anchor while
                // rendering its content, so a NESTED slot's fallback holder (multi-level
                // forwarding) can position against it after the mid's own bookends are
                // flattened away. Snapshot the CURRENT enclosing anchor first (a mid slot
                // captures its terminal leaf's anchor before overriding for its own body).
                const enclosingSlotAnchor = slotBodyAnchorStack[slotBodyAnchorStack.length - 1];
                if (!isScopedSlot) {
                    slotBodyAnchorStack.push(() => (frag.anchor.parentNode ? frag.anchor : null));
                }
                try {
                    const result = slotFn(data);
                    // Per-branch scopedness: the produced content is scoped iff the slot fn
                    // is statically scoped OR it produced a `scopedSlotFragment` marker. On
                    // a mismatch with THIS <slot>'s type (either direction), engine-core
                    // logs an error and renders NOTHING for this slot.
                    const producedScoped = staticScoped || containsScopedFragment(result);
                    if (producedScoped !== isScopedSlot) {
                        reportMismatch(name);
                        return [];
                    }
                    // Fill any DEFERRED `scopedSlotFragment` in the produced content with
                    // THIS scoped `<slot>`'s bound data (engine-core: the child's `<slot>`
                    // invokes the parent's scoped-slot factory with the resolved data). The
                    // factory was NOT invoked eagerly (a parent `lwc:if`'s persistent
                    // reactive render may re-produce it OUTSIDE any consuming `<slot>`), so
                    // this is where the real data reaches it.
                    if (isScopedSlot) {
                        fillScopedFragments(result, data);
                    }
                    // Slot REASSIGNMENT does not apply to scoped slots (engine-core).
                    if (!isScopedSlot) {
                        if (forwardAs !== undefined) {
                            // forwarding=true: empty target keeps `slot=""` (present).
                            retagSlot(result, fwdTag == null ? '' : String(fwdTag), true);
                        } else {
                            // TERMINAL slot: content landed; consume its `slot=` attr.
                            retagSlot(result, '');
                        }
                        if (name !== '' && forwardAs === undefined && recordSlotAssignment) {
                            recordSlotAssignment(result, name);
                        }
                    }
                    // EMPTY-ASSIGNED FALLBACK: keep the assigned content ALWAYS mounted
                    // (it self-empties via its own internal createIf) and ride a bookend-
                    // less holder fragment alongside it in this fragment's node list. The
                    // holder renders the fallback only while the assigned content has zero
                    // real nodes; the reactive toggle happens in the membership-epoch
                    // effect below. Filling it HERE (at mount, inside frag.nodes) means it
                    // rides normal insertion — no post-mount insertion-timing problem (the
                    // prior sync `hasRealContent` attempt failed because it ran before the
                    // content was in the DOM). The holder is anchorless + noBookends so it
                    // contributes NO comment nodes (engine-core keeps only the slot's own
                    // bookend pair). `getNextSibling`/`getParent` resolve to this slot
                    // fragment's own trailing anchor, so the fallback lands right before it.
                    if (eligibleFallback) {
                        assignedBlock = result;
                        const holder = new DynamicFragment();
                        holder.anchorlessIf = true;
                        holder.noBookends = true;
                        // Prefer THIS slot's own trailing anchor; but once this slot's
                        // content is nested inside a terminal leaf slot (multi-level
                        // forwarding) and flattened, `frag.anchor` detaches — fall back to
                        // the enclosing leaf slot's anchor (captured above), which the
                        // flatten keeps. Both resolve to the same live parent, so the
                        // fallback text lands in the correct slot region either way.
                        const resolveAnchor = (): Node | null => {
                            if (frag.anchor.parentNode) return frag.anchor;
                            return enclosingSlotAnchor ? enclosingSlotAnchor() : null;
                        };
                        holder.getNextSibling = resolveAnchor;
                        holder.getParent = () => resolveAnchor()?.parentNode ?? null;
                        fallbackHolder = holder;
                        fallbackShowing = countRealNodes(result) === 0;
                        holder.update(fallbackShowing ? fallback : undefined);
                        return [result, holder as unknown as Block];
                    }
                    return result;
                } finally {
                    setCurrentCoOwner(prevCo);
                    if (!isScopedSlot) slotBodyAnchorStack.pop();
                }
            };
            // A STATICALLY-scoped slot fn (`scopedSlot(...)`, non-conditional
            // `<template lwc:slot-data>`) wraps its content in an inner DynamicFragment
            // so the scoped content carries its OWN bookend pair, matching engine-core
            // which brackets each scoped-slot-content invocation. That pair is IN ADDITION
            // to this createSlot fragment's own — the named-slots scoped case expects two
            // (`<!----><!---->…<!----><!---->`). A CONDITIONAL scoped slot (a per-branch
            // `scopedSlotFragment` marker produced inside an `lwc:if`) does NOT get this
            // wrapper: the child's own inner `lwc:if` (the elseif that selected the scoped
            // branch) already supplies the extra pair, so wrapping again would double it
            // (scoped-slot if-block: the matching case expects exactly three pairs).
            frag.update(
                isScopedSlot && staticScoped
                    ? () => {
                          const inner = new DynamicFragment();
                          inner.update(body, '$scoped');
                          return inner;
                      }
                    : body,
                bindGetter ? data : name
            );
            // When the forward TARGET changed (a mid-level `slot={expr}` retarget:
            // forwarding-reactivity step 3), re-tag the mounted content in place so the
            // terminal reorder repositions it. A forwarding slot's frag is keyed on the
            // constant `name`, so frag.update above never re-runs `body`/retags for it;
            // all its reactivity flows through this retag + the reorder. Guarded on the
            // target actually changing so it doesn't fire on a container-level change
            // (step 2, where this slot's own target is unchanged).
            const fwd = fwdTag == null ? '' : String(fwdTag);
            if (
                !isScopedSlot &&
                forwardAs !== undefined &&
                prevFwd !== undefined &&
                prevFwd !== fwd
            ) {
                // A LIGHT mid re-tags the node CURRENTLY in this slot's bucket (the
                // container's live `slot=` assignment, snapshotted per-batch), because
                // this mid's own frag.nodes is pinned to its first-resolved content and
                // never re-resolved when the container redistributed (multi-level
                // forwarding step 2). A SHADOW mid keeps the frag.nodes path — its
                // content is projected through native `<slot>`, whose distribution the
                // browser recomputes from the (still-correct) frag.nodes' slot attr.
                // The forwarded content physically lives in the innermost LIGHT leaf's
                // child list (a multi-level chain terminates the DOM at the leaf). Use
                // the node's ACTUAL parent element as the membership scope: only a light
                // mid needs this remap, and only when the content landed in a live light
                // parent (a shadow leaf projects via native `<slot>`, leaving frag.nodes'
                // parent === the shadow-content region, which we skip via lightHost).
                const contentParent = resolveContentParent();
                if (contentParent) {
                    // GATHER NAME: which of the terminal leaf's `<slot name=X>`
                    // declarations owns this node. A TERMINAL slot (its own host holds the
                    // nodes) gathers under its own `name`; an INTERMEDIATE (mid) slot
                    // forwards them to `fwd` — the name the leaf gathers them under. Both
                    // resolve to the same leaf-gather-name. reorderLightSlots ranks by this
                    // stamp so display order follows the leaf's slot-declaration order
                    // (matching a shadow leaf's `<slot>` order), not the live forward
                    // attribute (multi-level forwarding step 4: leaf's own retarget).
                    const gname = contentParent === lightHost ? name : fwd;
                    // Which leaf-bucket currently holds THIS forwarding slot's occupants.
                    // When the content sits directly in the mid host, occupants carry
                    // `slot=name` (the mid's own declaration name). When it has landed in a
                    // deeper LEAF host, occupants were gathered under the mid's PREVIOUS
                    // forward target (`prevFwd`) — the leaf-gather-name from the last epoch —
                    // so look them up by that, not by the mid's declaration `name`.
                    const bucketKey = contentParent === lightHost ? name : (prevFwd ?? '');
                    const bucket = membershipBucket(contentParent, bucketKey);
                    if (bucket) {
                        for (const el of bucket) {
                            // A LIGHT child-component slotee RECREATES on a bucket change
                            // (engine-core keyed-slot diff); a plain element repositions in
                            // place. `recreateForwardedSlotee` returns the NEW host when it
                            // recreated (re-stamp __gname on it), or null to fall through to
                            // the in-place retag (plain nodes / non-recreatable hosts).
                            const recreated = recreateForwardedSlotee?.(el, fwd) ?? null;
                            if (recreated) {
                                (recreated as { __gname?: string }).__gname = gname;
                                continue;
                            }
                            (el as { __gname?: string }).__gname = gname;
                            retagSlot(el, fwd, true);
                        }
                    }
                } else {
                    retagSlot(frag.nodes, fwd, true);
                }
            }
            prevFwd = fwd;
        } else if (fallback) {
            frag.update(fallback, '$fallback');
        } else {
            frag.update(undefined);
        }
    });

    // EMPTY-ASSIGNED FALLBACK toggle (engine-core parity). Subscribes to the slot-
    // MEMBERSHIP epoch (bumped by `createIf` when a conditional inside slot content
    // toggles). On each bump, recount the ASSIGNED content's real nodes: when it drops
    // to zero (the forwarded source `lwc:if` went false) show the fallback in the
    // holder; when it regains content hide it again. This is the REACTIVE re-check the
    // prior synchronous `hasRealContent` attempt lacked — emptiness is only knowable
    // after the forwarding chain resolves + flattens, not at the sync createSlot point.
    // Composes UP a forwarding chain by REFERENCE: an eligible mid-level slot fills its
    // OWN holder first (parent-before-child flush order), so the terminal leaf counts
    // that as real content and shows the mid's fallback rather than its own — matching
    // the multi-level forwarding expected DOM. Counts ONLY `assignedBlock`, never
    // `frag.nodes` (which includes the holder — counting it would make a shown fallback
    // read as non-empty and flip-flop).
    if (eligibleFallback) {
        renderEffect(() => {
            trackSlotMembershipEpoch();
            if (!fallbackHolder || assignedBlock === undefined) return;
            const empty = countRealNodes(assignedBlock) === 0;
            if (empty === fallbackShowing) return;
            fallbackShowing = empty;
            fallbackHolder.update(empty ? fallback : undefined);
        });
    }

    // FORWARDING slots re-tag LATE-INSERTED authored content on the MEMBERSHIP epoch.
    // The main effect's `body` retag is memoized on the constant slot `name`, so it
    // runs ONCE — a node added LATER by a conditional/iterator INSIDE this slot's
    // content (e.g. `<p slot="upper" if:true>` toggling on) keeps its AUTHORED `slot=`
    // and is mis-distributed (multi-level light-DOM forwarding: the shadow/light leaf
    // routes it by the un-forwarded attribute into the wrong slot). This effect
    // subscribes to the MEMBERSHIP epoch (bumped by `createIf` on toggle — NOT the
    // slotAttr epoch, so a conditional toggle does not directly drive `reorderLightSlots`)
    // and re-tags such content to the forward target. It touches ONLY content that is
    // (a) UN-GATHERED (`__gname` unset — never went through the forwarding retag below)
    // and (b) currently in this slot's `name` membership bucket (`slot===name`: authored,
    // not yet forwarded — body-forwarded content already carries `slot=fwd`, so it is
    // ABSENT from the `name` bucket). That makes the effect inert at mount and for
    // already-forwarded siblings (which may alias into the same bucket by their live
    // `slot` but carry a stamped `__gname`), firing only for freshly-inserted content.
    // The retag bumps the slotAttr epoch → the terminal reorder repositions it (light
    // leaf) / native distribution re-routes it (shadow leaf); it is idempotent, so it
    // converges without perturbing DOM on unrelated toggles.
    if (!isScopedSlot && forwardAs !== undefined) {
        renderEffect(() => {
            trackSlotMembershipEpoch();
            const t = typeof forwardAs === 'function' ? (forwardAs() as string | null) : forwardAs;
            const fwd = t == null ? '' : String(t);
            // Resolve the live content parent (the leaf host) via the pinned frag.nodes,
            // same as the target-change retag below. Detached content (lightLight's
            // conditional lands in an orphan fragment whose child has no parentElement)
            // is skipped — it never surfaces into a live host.
            const firstEl = lightHost ? firstElementIn(frag.nodes) : null;
            const contentParent = firstEl?.parentElement ?? null;
            if (!contentParent) return;
            const gname = contentParent === lightHost ? name : fwd;
            const bucket = membershipBucket(contentParent, name);
            if (!bucket) return;
            for (const el of bucket) {
                if ((el as { __gname?: string }).__gname !== undefined) continue;
                if ((el.getAttribute('slot') ?? '') === fwd) continue;
                (el as { __gname?: string }).__gname = gname;
                retagSlot(el, fwd, true);
            }
        });
    }

    // STANDARD slots flatten nested fragment bookends in their resolved content
    // post-mount (engine-core `flattenFragmentsInChildren`). Scoped slots keep their
    // content's own bookends (each scoped invocation is intentionally bracketed).
    if (!isScopedSlot && registerSlotForFlatten) {
        registerSlotForFlatten(frag);
    }

    return frag;
}
