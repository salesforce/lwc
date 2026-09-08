/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { onScopeDispose, getActiveScope } from './block';
// The owner is an opaque component-instance handle (the facade's VaporInstance
// or the prototype's VaporComponentInstance); kept loose to avoid coupling.
type OwnerHandle = unknown;

type EffectFn = () => void;

/**
 * A doubly-linked reactivity graph (ported from Vue Vapor / alien-signals).
 *
 * A `Link` is one dependency edge — it lives simultaneously in TWO intrusive
 * doubly-linked lists: the dep's subscriber list (`prevSub`/`nextSub`, anchored at
 * `Dep.subs`/`subsTail`) and the effect's dependency list (`prevDep`/`nextDep`,
 * anchored at `ReactiveEffect.deps`/`depsTail`). This replaces the previous
 * `Set<ReactiveEffect>` dep + per-effect `Dep[]`/`seen` arrays. Two properties matter:
 *   - Teardown is O(1) POINTER SPLICES per edge (`unlink`), not O(deps) hash-Set
 *     deletes — the confirmed 7-9× clear/teardown win.
 *   - Re-runs REUSE the existing Link nodes positionally (`link`'s depsTail walk),
 *     so a steady-state update allocates nothing — protecting the update-path wins.
 *
 * LWC has no computed layer, so a `sub` is ALWAYS a plain effect and a `dep` is
 * ALWAYS plain reactive data; Vue's cascading-computed cleanup and SubscriberFlags
 * dirty-checking are intentionally dropped.
 */
export interface Link {
    dep: Dep;
    sub: ReactiveEffect;
    /** Position in the dep's subscriber list. */
    prevSub: Link | undefined;
    nextSub: Link | undefined;
    /** Position in the sub's dependency list. */
    prevDep: Link | undefined;
    nextDep: Link | undefined;
}

/**
 * A dependency: the head/tail of the intrusive list of effects subscribed to a
 * particular reactive key. Constructed via `createDep()` (a plain monomorphic
 * object — cheaper to allocate than a `Set` and than a class instance).
 */
export interface Dep {
    subs: Link | undefined;
    subsTail: Link | undefined;
}

export function createDep(): Dep {
    return { subs: undefined, subsTail: undefined };
}

// ---------------------------------------------------------------------------
// LINK / UNLINK — the intrusive doubly-linked-list core (ported from Vue Vapor's
// `system.ts`, minus the computed/cascade machinery LWC doesn't have).
//
// Subscribe `sub` to `dep`, called once per tracked read during a run. On a RE-RUN
// this REUSES the prior run's Link nodes positionally: `sub.depsTail` walks the
// existing chain, and when the next dep read matches the next Link, we advance the
// cursor instead of allocating. A steady-state re-run (same deps, same order) thus
// allocates nothing — the property that keeps the fine-grained update path (select /
// swap / partial-update, already WINS vs Vue) allocation-free.
function link(dep: Dep, sub: ReactiveEffect): void {
    const prevDep = sub.depsTail;
    // Consecutive duplicate read of the same dep (e.g. `{item.id}` then the
    // `className` getter re-reading `item.id`): already the tail, nothing to do.
    if (prevDep !== undefined && prevDep.dep === dep) {
        return;
    }
    // Positional REUSE: the Link that followed the cursor last run. If it points at
    // the same dep, this read matches the prior run's shape — advance the cursor and
    // reuse the node (no allocation).
    const nextDep = prevDep !== undefined ? prevDep.nextDep : sub.deps;
    if (nextDep !== undefined && nextDep.dep === dep) {
        sub.depsTail = nextDep;
        return;
    }
    // New edge (or changed dep shape): allocate a Link and splice it into BOTH lists
    // at the current cursor position (the dep's subscriber tail, the sub's dep tail).
    const prevSub = dep.subsTail;
    const newLink: Link = {
        dep,
        sub,
        prevDep,
        nextDep,
        prevSub,
        nextSub: undefined,
    };
    sub.depsTail = newLink;
    dep.subsTail = newLink;
    // Splice into the sub's dependency list.
    if (nextDep !== undefined) {
        nextDep.prevDep = newLink;
    }
    if (prevDep !== undefined) {
        prevDep.nextDep = newLink;
    } else {
        sub.deps = newLink;
    }
    // Splice into the dep's subscriber list.
    if (prevSub !== undefined) {
        prevSub.nextSub = newLink;
    } else {
        dep.subs = newLink;
    }
}

// Detach one Link from BOTH lists in O(1) pointer splices, returning the next dep
// link (so callers can walk a chain: `l = unlink(l, sub)`). No computed cascade —
// a `dep` with zero subscribers is simply left empty (its `depsForTarget` cache
// entry is reclaimed with the target via the WeakMap, as before).
function unlink(link: Link, sub: ReactiveEffect): Link | undefined {
    const { dep, prevDep, nextDep, prevSub, nextSub } = link;
    // Splice out of the sub's dependency list.
    if (nextDep !== undefined) {
        nextDep.prevDep = prevDep;
    } else {
        sub.depsTail = prevDep;
    }
    if (prevDep !== undefined) {
        prevDep.nextDep = nextDep;
    } else {
        sub.deps = nextDep;
    }
    // Splice out of the dep's subscriber list.
    if (nextSub !== undefined) {
        nextSub.prevSub = prevSub;
    } else {
        dep.subsTail = prevSub;
    }
    if (prevSub !== undefined) {
        prevSub.nextSub = nextSub;
    } else {
        dep.subs = nextSub;
    }
    return nextDep;
}

let currentEffect: ReactiveEffect | null = null;
let batchDepth = 0;
const pendingEffects = new Set<ReactiveEffect>();

// ---------------------------------------------------------------------------
// ASYNC/BATCHED RE-RENDER (engine-core parity). See ASYNC_RENDER_PARITY.md.
//
// engine-core defers a component re-render to a microtask: a tracked mutation
// marks the vm dirty + queues it; ONE microtask later the queue flushes
// (parent-before-child), SKIPPING any vm that disconnected in the meantime. Vapor
// is fine-grained + synchronous, so `this.items.push()` reconciles immediately —
// mounting children before a subsequent synchronous `removeChild` can cancel them.
// To match, a POST-initial-run effect re-notify is deferred to a microtask-batched
// queue instead of running synchronously.
//
// Gated behind a flag (default OFF) so it can be rolled out + measured in steps.
let ENABLE_ASYNC_RERENDER = false;
export function setEnableAsyncRerender(v: boolean): void {
    ENABLE_ASYNC_RERENDER = v;
}

// VUE-PARITY: when true, EVERY render effect (not just structural `deferrable` ones)
// defers its post-initial-run re-notify to the shared microtask queue — matching Vue
// Vapor, where `RenderEffect.notify()` always calls `queueJob`. When false, only
// `deferrable` (structural for/if) effects defer (the previous scoped model).
let VUE_PARITY_ASYNC = false;
export function setVueParityAsync(v: boolean): void {
    VUE_PARITY_ASYNC = v;
}

// While > 0, `notify()` runs effects SYNCHRONOUSLY instead of deferring. Used by
// createFor to flush a reused item's `itemRef`/`indexRef`-driven bindings inline during
// the reconcile (before it moves blocks), so those bindings don't defer past the move's
// dc/cc teardown. Scoped narrowly to the reconcile's ref-update window.
let syncNotifyDepth = 0;
export function runWithSyncNotify<T>(fn: () => T): T {
    syncNotifyDepth++;
    try {
        return fn();
    } finally {
        syncNotifyDepth--;
    }
}

// WHOLE-TEMPLATE RE-RENDER: when true, a tracked mutation of a component re-runs ALL of
// that component's render effects (engine-core: any rehydration re-reads every binding),
// not just the fine-grained effect subscribed to the changed value. Requires the async
// model (the sibling effects are queued into the same batched flush).
let WHOLE_TEMPLATE_RERENDER = false;
export function setWholeTemplateRerender(v: boolean): void {
    WHOLE_TEMPLATE_RERENDER = v;
}
// owner (VaporInstance) → its render effects. Used to expand a single notify into a
// whole-component re-render.
const ownerEffects = new WeakMap<object, Set<ReactiveEffect>>();

// Re-run ALL of a component's registered render effects (its whole template). Called
// when an OBSERVED field is mutated that may have NO direct binding subscriber — e.g. a
// custom `render()` reads it indirectly, or a field no binding reads (side-effects
// `bar`). engine-core marks the vm dirty on ANY observed-field write and rehydrates
// (re-reads all bindings + re-invokes render()), regardless of fine-grained deps. Each
// effect's own `notify()` handles async deferral / disconnected-skip. Non-`deferrable`
// (plain render/binding) effects only — structural for/if reconciles are targeted.
export function triggerWholeTemplate(owner: object): void {
    if (!WHOLE_TEMPLATE_RERENDER) return;
    const effects = ownerEffects.get(owner);
    if (!effects) return;
    // Snapshot: an effect's run may register/stop effects (mutating the set).
    for (const effect of [...effects]) {
        if (!effect.deferrable) effect.notify();
    }
}

// Register an externally-created ReactiveEffect (e.g. the component render-driver, which
// is built directly rather than via `renderEffect`) under an owner, so
// `triggerWholeTemplate` re-runs it on any observed-field mutation — engine-core
// re-invokes render() on ANY tracked change (rendering/side-effects). Cleared on stop.
export function registerOwnerEffect(owner: object, effect: ReactiveEffect): void {
    let set = ownerEffects.get(owner);
    if (!set) ownerEffects.set(owner, (set = new Set()));
    set.add(effect);
    effect.registeredOwner = owner;
}

// Facade-provided hooks (kept decoupled from VaporInstance). The owner is the
// component instance that owns an effect; the facade knows its disconnected state
// and creation index (for parent-before-child flush ordering).
let isOwnerDisconnected: ((owner: OwnerHandle | null) => boolean) | null = null;
let ownerIdx: ((owner: OwnerHandle | null) => number) | null = null;
let isOwnerMounted: ((owner: OwnerHandle | null) => boolean) | null = null;
export function setAsyncRerenderHooks(
    isDisconnected: (owner: OwnerHandle | null) => boolean,
    idx: (owner: OwnerHandle | null) => number,
    mounted: (owner: OwnerHandle | null) => boolean
): void {
    isOwnerDisconnected = isDisconnected;
    ownerIdx = idx;
    isOwnerMounted = mounted;
}

// Called when a deferred effect's run THROWS during the async flush (e.g. a
// createIf reconcile mounts a child whose render()/lifecycle throws, or the routed
// error is the parent errorCallback's own re-throw). The facade routes it to the
// owner's errorCallback boundary and, if unhandled, reports it to the platform
// (window error) — WITHOUT rethrowing into the flush, so one throwing effect does
// not abort the whole batch or leave the queue in a poisoned state (which turned
// the errorCallback value-mutation tests into a full-file hang).
let onDeferredEffectError: ((owner: OwnerHandle | null, err: unknown) => void) | null = null;
export function setOnDeferredEffectError(
    fn: (owner: OwnerHandle | null, err: unknown) => void
): void {
    onDeferredEffectError = fn;
}

// ---------------------------------------------------------------------------
// FLUSH-TIME ERROR ROUTING (errorCallback-throws-after-value-mutation).
//
// When a deferred `lwc:if` reconcile mounts a child DURING flushAsyncQueue and that
// child throws (constructor/connectedCallback/render/renderedCallback), the throw is
// caught in create-element's native-CE `connectedCallback` reaction. Routing it to
// the parent boundary's errorCallback INLINE there (i.e. invoking a THROWING
// errorCallback synchronously inside the CE reaction, inside `effect.run()`, inside
// this flush) FREEZES the thread — the boundary re-throw does not cleanly unwind the
// native reaction; it re-enters the reactive machine and spins.
//
// engine-core avoids this: flushRehydrationQueue routes the child throw to the
// boundary, the boundary errorCallback re-throws, and that re-throw propagates OUT of
// flushRehydrationQueue (invoked from `Promise.resolve().then(...)`) as an UNHANDLED
// REJECTION. Mirror it: the CE reaction CAPTURES `{owner, err}` here and SWALLOWS
// (reports nothing to window). After the flush fully drains (below), we invoke the
// boundary errorCallback OUTSIDE the CE reaction / effect run; its re-throw then
// propagates out of flushAsyncQueue → rejects the flush microtask → the platform's
// 'unhandledrejection' — the exact engine-core mechanism, with no synchronous escape
// from the CE reaction and no new setTimeout/macrotask surface.
const pendingFlushErrors: Array<{ owner: OwnerHandle | null; err: unknown }> = [];

// True while dispatching captured flush errors (below). A boundary errorCallback that
// mutates state during dispatch must NOT synchronously re-enter another dispatch pass;
// isFlushingAsync stays true so any fresh capture just appends and is drained in-loop.
let dispatchingFlushErrors = false;

// Returns true if the CE reaction captured the error (caller must SWALLOW). Only
// captures while actually flushing — a synchronous mount routes inline as before.
export function captureFlushError(owner: OwnerHandle | null, err: unknown): boolean {
    if (!flushingAsync) return false;
    pendingFlushErrors.push({ owner, err });
    return true;
}

// Called when a queued re-render effect is DROPPED at flush because its owner
// disconnected (engine-core's flushRehydrationQueue connected-skip). The facade uses
// it to mark a pending rehydration so the owner's later reconnect suppresses its rc.
let onEffectDroppedWhileDisconnected: ((owner: OwnerHandle | null) => void) | null = null;
export function setOnEffectDroppedWhileDisconnected(fn: (owner: OwnerHandle | null) => void): void {
    onEffectDroppedWhileDisconnected = fn;
}

// The deferred re-run queue + its single armed microtask.
const asyncQueue = new Set<ReactiveEffect>();
let asyncFlushArmed = false;
const MAX_ASYNC_FLUSH_CYCLES = 1000;

function armAsyncFlush(): void {
    if (asyncFlushArmed) return;
    asyncFlushArmed = true;
    void Promise.resolve().then(flushAsyncQueue);
}

// Called at the END of the async structural-reconcile drain, in the SAME microtask,
// to run the renderedCallback flush inline — so the two queues form ONE ordered pass
// (reconciles → renderedCallbacks), matching engine-core's single flushRehydrationQueue.
let postAsyncFlush: (() => void) | null = null;
export function setPostAsyncFlush(fn: () => void): void {
    postAsyncFlush = fn;
}

// ---------------------------------------------------------------------------
// DETACHED REHYDRATION (engine-core parity). A POST-mount set of an `@api`
// ACCESSOR prop schedules a rehydration of the bindings that read it — engine-core's
// createPublicAccessorDescriptor → componentValueMutated → scheduleRehydration. Unlike
// the structural async queue above, this queue does NOT skip disconnected owners: a
// child detached AFTER its prop was set still rehydrates (DISABLE_DETACHED_REHYDRATION
// is false), which is exactly what `reactivity/scheduled-rehydration` asserts.
//
// `withForcedDefer(fn)` makes every `notify()` during `fn` route to this queue instead
// of running synchronously — but ONLY for an effect whose owner is already MOUNTED. A
// notify during the owner's INITIAL mount (the parent applying the prop's initial value
// while first rendering the child) is dropped: engine-core schedules no rehydration for
// the initial value, it is simply the mount value.
let forceDeferDepth = 0;
const detachedQueue = new Set<ReactiveEffect>();

export function withForcedDefer<T>(fn: () => T): T {
    forceDeferDepth++;
    try {
        return fn();
    } finally {
        forceDeferDepth--;
    }
}

function armDetachedFlush(): void {
    // The detached (rehydration) queue is drained by the SAME unified flush as the
    // structural queue — a single armed microtask processes BOTH until both are empty.
    // This matters because a structural reconcile (flushed here) re-applies an `@api`
    // prop to a reused child, which schedules a FRESH detached rehydration; that must
    // drain in the SAME microtask pass, not a later one (else a reused child's binding
    // would rehydrate after the caller's `await Promise.resolve()` — scheduled-rehydration
    // asserts the reused child rehydrated within one microtask).
    armAsyncFlush();
}

// Run a deferred effect, isolating any throw: route it to the owner's boundary via
// the facade (which reports to the platform if unhandled) instead of letting it abort
// the flush. Without isolation, a throwing reconcile (errorCallback value-mutation:
// parent errorCallback re-throws) escaped the flush and left the batch/queue poisoned
// → full-file hang.
function runDeferred(effect: ReactiveEffect): void {
    if (!onDeferredEffectError) {
        effect.run();
        return;
    }
    try {
        effect.run();
    } catch (err) {
        onDeferredEffectError(effect.owner, err);
    }
}

function flushAsyncQueue(): void {
    asyncFlushArmed = false;
    let cycles = 0;
    // ONE `lwc-rerender` (cascade) span wraps the WHOLE batched flush — a batch is a
    // single rerender tick (engine-core's one flushRehydrationQueue / Vue's one flush).
    // With VUE_PARITY_ASYNC the per-`trigger` cascade spans are suppressed (see `trigger`),
    // so this is the sole rerender span; the render/patch spans emitted by the effects that
    // run inside nest under it (performance-timing "nested component tree rerender" expects
    // exactly one lwc-rerender per batch). Guard on there being work + a hook installed.
    const emitSpan =
        VUE_PARITY_ASYNC &&
        onCascadeStart != null &&
        (asyncQueue.size > 0 || detachedQueue.size > 0);
    if (emitSpan) onCascadeStart!();
    const prevFlushing = flushingAsync;
    flushingAsync = true;
    try {
        while (asyncQueue.size > 0 || detachedQueue.size > 0) {
            if (++cycles > MAX_ASYNC_FLUSH_CYCLES) {
                asyncQueue.clear();
                detachedQueue.clear();
                // eslint-disable-next-line no-console
                console.error(
                    '[LWC error]: Maximum async re-render cycles exceeded — an effect keeps ' +
                        'dirtying its own dependencies.'
                );
                return;
            }
            // Detached rehydrations FIRST. A child whose `@api` prop was set is rehydrated
            // here — and it must run BEFORE the structural reconcile that may REMOVE it (the
            // reconcile stops the removed item's effect scope; a stopped effect never runs).
            // engine-core rehydrates a vm that was queued before being disconnected
            // (DISABLE_DETACHED_REHYDRATION === false), so there is NO disconnected skip here.
            if (detachedQueue.size > 0) {
                const batch = [...detachedQueue];
                detachedQueue.clear();
                if (ownerIdx) {
                    batch.sort((a, b) => ownerIdx!(a.owner) - ownerIdx!(b.owner));
                }
                for (const effect of batch) {
                    runDeferred(effect);
                }
            }
            // Structural reconciles next (parent-before-child by owner idx), SKIPPING any
            // owner disconnected since it was queued (mutate→disconnect→cancel). A reconcile
            // that re-applies an `@api` prop to a REUSED child enqueues a fresh detached
            // rehydration, drained on the next loop iteration (same microtask).
            if (asyncQueue.size > 0) {
                const batch = [...asyncQueue];
                asyncQueue.clear();
                if (ownerIdx) {
                    // STRUCTURAL (deferrable) reconciles run BEFORE plain binding effects
                    // in the same flush; within each group, parent-before-child by owner idx.
                    // A keyed `for:each` reconcile (structural) that REMOVES a row stops that
                    // row's effect scope — which must happen BEFORE a PARENT-owned scoped-slot
                    // body binding of that same doomed row runs, or the binding would rehydrate
                    // the doomed child with an in-place-mutated value (`identifier={item.id}`
                    // where `item.id` mutated 39→38) before it disconnects. Running the
                    // structural reconcile first neutralizes the doomed row's stopped bindings,
                    // so the removed row tears down reporting its CAPTURED value (scoped-slot
                    // keyed reactivity: `child-39:disconnectedCallback`, not `child-38`).
                    batch.sort((a, b) => {
                        if (a.deferrable !== b.deferrable) return a.deferrable ? -1 : 1;
                        return ownerIdx!(a.owner) - ownerIdx!(b.owner);
                    });
                }
                for (const effect of batch) {
                    if (isOwnerDisconnected && isOwnerDisconnected(effect.owner)) {
                        // A queued re-render whose owner disconnected before the flush is
                        // DROPPED (engine-core flushRehydrationQueue skips disconnected vms).
                        // Notify the facade so it records a PENDING rehydration on the owner —
                        // a later reconnect must suppress its own renderedCallback (the dropped
                        // rehydration owns it). Without this, an async-deferred mutation
                        // followed by disconnect loses the pending-rc marker that the previous
                        // synchronous path set (lifecycle "connect/mutate/disconnect/reconnect").
                        if (onEffectDroppedWhileDisconnected) {
                            onEffectDroppedWhileDisconnected(effect.owner);
                        }
                        continue;
                    }
                    runDeferred(effect);
                }
            }
        }
    } finally {
        flushingAsync = prevFlushing;
        if (emitSpan) onCascadeEnd!();
    }
    // Drain renderedCallbacks INLINE (same microtask), AFTER all reconciles — one
    // ordered pass instead of two racing microtask queues (which scrambled cc/rc
    // ordering in earlier attempts).
    if (postAsyncFlush) postAsyncFlush();
    // DISPATCH captured flush-time child errors POST-DRAIN (engine-core parity). A
    // child that threw during a deferred `lwc:if` reconcile had its {owner, err}
    // captured (see captureFlushError) instead of routing INLINE in the native-CE
    // reaction (which froze the thread). Now — outside the CE reaction and outside any
    // effect.run() — invoke each owner's errorCallback boundary. If a boundary
    // errorCallback re-throws, KEEP the first such re-throw and THROW it out of
    // flushAsyncQueue: since flushAsyncQueue runs from `Promise.resolve().then(...)`,
    // the throw rejects that microtask → 'unhandledrejection' fires on the SAME flush
    // tick (engine-core's flushRehydrationQueue re-throw). No setTimeout/macrotask.
    if (pendingFlushErrors.length > 0 && !dispatchingFlushErrors) {
        // SNAPSHOT + CLEAR first (engine-core clears the queue before the loop) so a
        // boundary errorCallback that itself dirties state cannot poison a later pass.
        const batch = pendingFlushErrors.splice(0, pendingFlushErrors.length);
        dispatchingFlushErrors = true;
        let firstReThrow: unknown;
        let hasReThrow = false;
        try {
            for (const { owner, err } of batch) {
                if (!onDeferredEffectError) continue;
                // onDeferredEffectError routes to owner's boundary. If the boundary
                // errorCallback re-throws (unhandled), the hook RE-THROWS it here; KEEP
                // the first and continue dispatching the rest.
                try {
                    onDeferredEffectError(owner, err);
                } catch (reThrow) {
                    if (!hasReThrow) {
                        hasReThrow = true;
                        firstReThrow = reThrow;
                    }
                }
            }
        } finally {
            dispatchingFlushErrors = false;
        }
        // Surface the first unhandled boundary re-throw by THROWING it out of
        // flushAsyncQueue. Since flushAsyncQueue runs from `Promise.resolve().then(...)`,
        // this rejects that microtask → the platform fires 'unhandledrejection' on the
        // SAME flush tick (engine-core's flushRehydrationQueue re-throw). No new
        // setTimeout/reportError surface.
        if (hasReThrow) {
            throw firstReThrow;
        }
    }
}

export class ReactiveEffect {
    private fn: EffectFn;
    /** Head of this effect's dependency list (a chain of `Link` nodes). Deps read
     *  during a run are appended/reused here; teardown unlinks them. */
    deps: Link | undefined = undefined;
    /** Tail of the dependency list. During a run this advances as deps are read; it
     *  marks the boundary between deps re-read THIS run (before it) and the prior
     *  run's stale tail (after it, swept by `endTracking`). Reset to `undefined` at
     *  the start of each run so `link()` can reuse the prior chain positionally. */
    depsTail: Link | undefined = undefined;
    /** The id of the most recent `trigger` that queued this effect — dedupes an
     *  effect reachable from a single dep via multiple links (e.g. an array effect
     *  that reads `ITERATE_KEY` several times) so it is notified at most once per
     *  trigger, with no reset pass (the counter only increases). 0 = never queued. */
    notifyId = 0;
    /** Whether the effect has run at least once. */
    private ran = false;
    /** Whether a run is currently in progress (re-entrancy guard). */
    private running = false;
    private active = true;
    /** Permanently stopped (scope disposed). A stopped effect never runs again. */
    private stopped = false;
    owner: OwnerHandle | null = null;
    /** The owner this effect was REGISTERED under in `ownerEffects` (for whole-template
     *  re-render); cleared on stop so a torn-down effect isn't re-run by a sibling. */
    registeredOwner: object | null = null;
    /** When true, a POST-initial-run re-notify of this effect is DEFERRED to the
     *  microtask-batched flush (engine-core parity) instead of running synchronously.
     *  Set ONLY on STRUCTURAL effects (createFor reconcile, createIf branch switch) —
     *  the mount/teardown that engine-core defers. Binding/text/attr effects stay
     *  synchronous (vapor's fine-grained updates there are observed immediately and
     *  relied upon by the suite). */
    deferrable = false;
    /** When true, this effect is EXEMPT from `withForcedDefer` (the @api-accessor
     *  rehydration scheduling). The component's render-driver effect (template-switch)
     *  must keep its OWN scheduling — a parent setting a child's `@api` accessor mid-
     *  render must not reroute the child's render() switch through the detached queue
     *  (which skips the structural teardown path → disconnectedCallback never fires;
     *  "disconnectedCallback ... parent switches template"). Binding effects that read
     *  the accessor's getter are NOT exempt — those defer (scheduled-rehydration). */
    forcedDeferExempt = false;
    /** Set to true by the WHOLE-TEMPLATE expansion below when this effect is queued as
     *  a SIBLING (side-effect replay) of some OTHER notified effect, rather than because
     *  one of its OWN deps changed. The render-driver effect reads this to decide whether
     *  a re-run should ONLY replay `render()`'s side effects (sibling replay → true) or
     *  may also schedule a template switch (direct dep-change notify → false). A DIRECT
     *  notify (`asyncQueue.add(this)`) always clears it so the primary path wins over a
     *  same-flush sibling-add. Meaningless for plain binding effects (they never read it). */
    siblingReplay = false;
    /** When true, this effect's OWN `notify()` runs SYNCHRONOUSLY (skips the async/Vue-
     *  parity defer), preserving the pre-existing timing for the render-driver: a
     *  template-determining field change must schedule its `reRenderInstance` on the SAME
     *  microtask turn the mutation happened (template-switch tests do `next(); await
     *  Promise.resolve()`). The driver is STILL re-runnable as a whole-template SIBLING —
     *  the expansion adds it to the async queue DIRECTLY (bypassing `notify()`), so its
     *  side-effect replay still defers into the batched flush. Set only on the driver. */
    syncSelfNotify = false;

    constructor(fn: EffectFn) {
        this.fn = fn;
    }

    run(): void {
        // A stopped effect (its owning scope was torn down, e.g. the component
        // unmounted) must never run again, even if something still holds a stale
        // reference and notifies it. Running it would resurrect torn-down work and,
        // across many test files, accumulate into an effectively infinite loop.
        if (this.stopped) {
            return;
        }
        if (!this.active) {
            this.fn();
            return;
        }
        // Re-entrancy guard: if this effect is already running (e.g. its own body
        // synchronously triggered it), do not start a nested tracking pass — that
        // would corrupt the dep collection. Skip; the outer run captures deps.
        if (this.running) {
            return;
        }
        const prevEffect = currentEffect;
        const prevOwner = currentOwner;
        // Publish this effect as the active dependency-tracking target for the run — the
        // fine-grained reactivity pattern requires exposing `this` as a module-level global.
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        currentEffect = this;
        // Propagate ownership so child effects created during this run (e.g. a
        // v-if branch's inner text effects, created when the branch re-renders)
        // inherit the same owning component instance.
        currentOwner = this.owner;
        this.running = true;
        // START TRACKING: reset the dep-list cursor to the head. As the body reads
        // reactive keys, `link()` walks this cursor forward — REUSING the prior run's
        // Link nodes in place when the same deps are read in the same order (the common
        // steady-state case), so a re-run allocates ZERO Links. `deps` (the head) is
        // left intact for that reuse; only `depsTail` is reset.
        this.depsTail = undefined;
        try {
            this.fn();
        } finally {
            // END TRACKING (mark-and-sweep, now O(stale) pointer splices): every Link
            // AFTER `depsTail` was read last run but NOT this run — unlink it. On the
            // FIRST run `depsTail` is undefined and `deps` is undefined, so the loop is
            // a no-op (the mount hot path allocates the Links inline via `link()` with
            // no sweep — matching the old first-run fast path, now allocation-lean by
            // construction rather than by a skipped `seen` Set).
            // `this.fn()` mutated `depsTail` via `link()`, but TS narrowed it to
            // `undefined` from the reset above (property narrowing doesn't reset across
            // the opaque call) — read through a widening cast.
            const depsTail = this.depsTail as Link | undefined;
            let stale = depsTail !== undefined ? depsTail.nextDep : this.deps;
            while (stale !== undefined) {
                stale = unlink(stale, this);
            }
            this.running = false;
            this.ran = true;
            currentEffect = prevEffect;
            currentOwner = prevOwner;
        }
    }

    stop(): void {
        this.stopped = true;
        // O(edges) POINTER SPLICES (was O(deps) hash-Set deletes): walk this effect's
        // dependency list, unlinking each edge from BOTH the effect's dep list and the
        // dep's subscriber list. This is the confirmed 7-9× clear/teardown win — a
        // torn-down component's N effects each unlink in a straight pointer walk instead
        // of hashing into and deleting from N Sets.
        let link = this.deps;
        while (link !== undefined) {
            link = unlink(link, this);
        }
        this.deps = undefined;
        this.depsTail = undefined;
        this.active = false;
        // Deregister from its owner's effect set (whole-template re-render) so a sibling
        // effect's re-render never resurrects this torn-down effect.
        if (this.registeredOwner) {
            ownerEffects.get(this.registeredOwner)?.delete(this);
            this.registeredOwner = null;
        }
    }

    notify(): void {
        // Never re-queue a stopped effect.
        if (this.stopped) return;
        // Self-trigger guard (Vue's default no-recurse): if this effect is CURRENTLY
        // running, a write it made during its own body notified it. Re-running would
        // loop (e.g. a getter with a `this._n++` side effect that the template reads —
        // the read subscribes the binding to `_n`, the write re-triggers it). The sync
        // path already skips this via `run()`'s `running` guard; the async path must not
        // re-queue it either, or the flush loop spins to the cycle cap
        // (reactivity/scheduled-rehydration `value` getter increments `_called`).
        if (this.running) return;
        if (batchDepth > 0) {
            pendingEffects.add(this);
            return;
        }
        // ASYNC re-render (engine-core parity): a POST-initial-run re-notify is
        // deferred to a microtask-batched flush instead of running synchronously.
        // The very first run (`ran === false`) still runs synchronously here — but
        // in practice the first run happens via `effect.run()` directly in
        // renderEffect/createFor/createIf, so a `notify` is always a re-run.
        // Defer ONLY a deferrable (structural) effect whose owner is already MOUNTED
        // — a re-notify DURING the initial mount (e.g. a `connectedCallback` mutating a
        // for:each source, or nested mount-time reconciles) stays synchronous, matching
        // engine-core (initial render is synchronous; only POST-mount rehydration is
        // batched to a microtask). This keeps the many sync-read `for:each` mount
        // assertions working while still deferring genuine post-mount reconciles.
        // VUE-PARITY async model: a POST-initial-run re-notify of ANY render effect
        // whose owning component is already MOUNTED defers to the shared microtask queue
        // (Vue's `RenderEffect.notify()` → `queueJob`). This is NOT limited to structural
        // (`deferrable`) effects — Vue defers every render effect, including bindings, and
        // batches them into one flush. The very first run stays synchronous (it happens via
        // `effect.run()` in renderEffect/createFor/createIf, not through `notify`), matching
        // Vue's synchronous initial mount. An effect with NO mounted owner (e.g. the perf
        // bench's raw createFor, or a mid-initial-mount reconcile) still runs synchronously.
        // A keyed-list reconcile updates each reused item's `itemRef`/`indexRef` and must
        // let the resulting per-item bindings run SYNCHRONOUSLY, as one coherent unit,
        // BEFORE the reconcile then MOVES blocks (a move fires dc/cc which tears down +
        // remounts the item's effects — a deferred binding would run against a stopped
        // effect). Vue avoids this because a component is ONE update job; vapor's
        // fine-grained per-item bindings need this explicit sync window. `syncNotifyDepth`
        // is raised by createFor around its ref-update loop.
        // Forced defer (an `@api` accessor prop set) — checked BEFORE the general async
        // branch. engine-core's componentValueMutated SCHEDULES a rehydration for the
        // bindings that read the accessor; that rehydration goes to the DETACHED queue,
        // which rehydrates the owner even if a later structural reconcile disconnects it
        // (DISABLE_DETACHED_REHYDRATION === false — reactivity/scheduled-rehydration). If
        // this fell through to the general asyncQueue instead, a subsequent parent
        // reconcile (parent-first, same flush) would remove + stop the child before its
        // binding ran, losing the rehydration. Render-driver template-switch is EXEMPT
        // (keeps its own scheduling so the structural teardown path runs).
        //   - owner mounted → detached queue.
        //   - owner still mounting → DROP (the prop's mount value is not a mutation; else
        //     the binding double-evaluates at mount — scheduled-rehydration getter-count).
        if (!this.forcedDeferExempt && forceDeferDepth > 0 && this.ran) {
            if (isOwnerMounted && isOwnerMounted(this.owner)) {
                detachedQueue.add(this);
                armDetachedFlush();
            }
            return;
        }
        // VUE-PARITY async model: a POST-initial-run re-notify of ANY render effect whose
        // owning component is already MOUNTED defers to the shared microtask queue (Vue's
        // `RenderEffect.notify()` → `queueJob`) — not limited to structural (`deferrable`)
        // effects. Initial run stays synchronous (via `effect.run()` in
        // renderEffect/createFor/createIf, not `notify`). `syncNotifyDepth` (raised by
        // createFor around its reused-item ref updates) forces a synchronous run so per-
        // item bindings flush as one reconcile unit BEFORE block moves fire dc/cc.
        if (
            ENABLE_ASYNC_RERENDER &&
            this.ran &&
            syncNotifyDepth === 0 &&
            !this.syncSelfNotify &&
            (this.deferrable || VUE_PARITY_ASYNC) &&
            isOwnerMounted &&
            isOwnerMounted(this.owner)
        ) {
            // A DIRECT notify (this effect's own dep changed) clears its sibling-replay
            // marker so the primary path wins over any same-flush sibling-add: the render
            // driver, when notified because a template-determining field it reads changed,
            // must be allowed to schedule a template switch even if an unrelated binding
            // also expanded it as a sibling this flush.
            this.siblingReplay = false;
            asyncQueue.add(this);
            // WHOLE-TEMPLATE RE-RENDER: also queue every OTHER render effect of the same
            // owner, so the component's whole template re-reads its bindings this flush
            // (engine-core marks the vm dirty → rehydration re-reads all bindings). A
            // deep mutation observed only by another binding, or a change to a field no
            // binding read (side-effects), thus still updates every binding. Structural
            // (`deferrable`) effects are NOT expanded from here — a for/if reconcile is a
            // targeted structural update, not a whole-template read (expanding it would
            // re-run unrelated bindings mid-reconcile); only plain render-effect notifies
            // expand. Siblings are added to the SAME batch (deduped by the Set). A sibling
            // NOT already queued (i.e. not a primary this flush) is flagged as a
            // side-effect replay so the render driver, if it is that sibling, re-invokes
            // render() to replay side effects WITHOUT scheduling a spurious template switch.
            if (WHOLE_TEMPLATE_RERENDER && !this.deferrable && this.registeredOwner) {
                const siblings = ownerEffects.get(this.registeredOwner);
                if (siblings) {
                    for (const sib of siblings) {
                        if (sib !== this && !sib.deferrable) {
                            if (!asyncQueue.has(sib)) sib.siblingReplay = true;
                            asyncQueue.add(sib);
                        }
                    }
                }
            }
            armAsyncFlush();
            return;
        }
        this.run();
    }
}

export function track(dep: Dep): void {
    if (currentEffect) {
        link(dep, currentEffect);
    }
}

/**
 * Run `fn` WITHOUT subscribing the currently-running effect to any deps read
 * inside it. Used when applying a value to the DOM (which may read back the
 * current property/attribute to diff it): that read-back must not subscribe the
 * writing effect to the very property it is writing, or a later external write
 * to that property would re-run the effect and clobber the external value.
 * Mirrors Vue's `pauseTracking()`/`resetTracking()`.
 */
export function untrack<T>(fn: () => T): T {
    const prev = currentEffect;
    currentEffect = null;
    try {
        return fn();
    } finally {
        currentEffect = prev;
    }
}

// Circuit breaker: if a single synchronous trigger cascade re-runs effects far
// more than the number of effects involved, we're in an infinite update loop.
// Bail with an error (like Vue's "Maximum recursive updates exceeded") rather
// than freezing the browser.
let triggerDepth = 0;
const runCounts = new WeakMap<ReactiveEffect, number>();
const MAX_RECURSION = 100;

// True while the async batch flush is draining (one cascade span already wraps it).
let flushingAsync = false;

// True while flushAsyncQueue() is draining the batched re-render queue. A deferred
// child created during that window is a POST-MOUNT async reconcile; one created
// while this is FALSE is either an initial render or a SYNCHRONOUS mid-mount
// reconcile (an error boundary whose errorCallback toggled a branch before its own
// mount completed). create-element uses this to gate a fallback error-routing owner
// so it applies only to the synchronous case (see DEFERRED_ERROR_OWNER).
export function isFlushingAsync(): boolean {
    return flushingAsync;
}

// Optional hooks bracketing a synchronous reactive update cascade (the vapor
// analogue of engine-core's "global rerender"). Set by the facade for profiling.
let onCascadeStart: (() => void) | null = null;
let onCascadeEnd: (() => void) | null = null;
export function setCascadeHooks(start: () => void, end: () => void): void {
    onCascadeStart = start;
    onCascadeEnd = end;
}

// When > 0, reactive triggers are SUPPRESSED. Set while a user `render()` runs:
// a reactive mutation made during render (e.g. `this.results.push(...)` in a
// `render()` that also reads `this.results`) is a SIDE EFFECT — it must not
// re-trigger the render-tracking effect (which would loop forever) and is already
// dev-warned elsewhere. Covers ALL trigger sources (component set-trap, array
// instrumentation, defineProperty), unlike the per-proxy globalIsInvokingRender flag.
let suppressTriggerDepth = 0;
export function suppressTriggers<T>(fn: () => T): T {
    suppressTriggerDepth++;
    try {
        return fn();
    } finally {
        suppressTriggerDepth--;
    }
}

// Monotonic id stamped onto each effect as it is collected for a trigger, so an
// effect reachable via multiple links from the SAME dep (a non-consecutive duplicate
// read — e.g. an array effect reading `ITERATE_KEY` more than once) is collected at
// most once per trigger. Only ever increments — no per-trigger reset pass (which
// would add O(subs) work to the hot update path). Wraparound is a non-issue (2^53).
let triggerIdCounter = 0;

export function trigger(dep: Dep): void {
    if (suppressTriggerDepth > 0) return;
    // Snapshot the dep's subscribers into an array BEFORE notifying — an effect's
    // synchronous `notify()`/`run()` may re-track (mutating this dep's subscriber
    // list mid-walk) or stop siblings; iterating the live linked list would be
    // corrupted by that. Mirrors the old `[...dep]` copy. Dedup duplicate links to
    // the same effect via a monotonic per-trigger id (replaces the Set's inherent
    // uniqueness). Fast path: a single subscriber (the overwhelmingly common case —
    // one binding per key) skips the array + dedup entirely.
    const head = dep.subs;
    if (head === undefined) return;
    let effects: ReactiveEffect[];
    if (head.nextSub === undefined) {
        effects = [head.sub];
    } else {
        const id = ++triggerIdCounter;
        effects = [];
        for (let l: Link | undefined = head; l !== undefined; l = l.nextSub) {
            const effect = l.sub;
            if (effect.notifyId !== id) {
                effect.notifyId = id;
                effects.push(effect);
            }
        }
    }
    // Cascade span policy:
    //  - VUE_PARITY_ASYNC: the `lwc-rerender` span is emitted ONCE per FLUSH (in
    //    flushAsyncQueue), so NO per-trigger span here — the mutation-time trigger that
    //    merely QUEUES effects must not open its own span (that produced N+1 spans).
    //  - otherwise (sync / scoped-async): a top-level trigger brackets one span (legacy).
    const isTop = triggerDepth === 0 && !flushingAsync && !VUE_PARITY_ASYNC;
    if (isTop && onCascadeStart) onCascadeStart();
    triggerDepth++;
    try {
        for (const effect of effects) {
            if (triggerDepth > 1) {
                const count = (runCounts.get(effect) ?? 0) + 1;
                runCounts.set(effect, count);
                if (count > MAX_RECURSION) {
                    // eslint-disable-next-line no-console
                    console.error(
                        '[LWC error]: Maximum recursive updates exceeded. This indicates a ' +
                            'reactive effect that mutates its own dependencies on every run.'
                    );
                    continue;
                }
            }
            effect.notify();
        }
    } finally {
        triggerDepth--;
        if (triggerDepth === 0) {
            // Reset per-effect counts at the top of the cascade.
            for (const effect of effects) runCounts.delete(effect);
            // Only close a span this trigger opened (`isTop`).
            if (isTop && onCascadeEnd) onCascadeEnd();
        }
    }
}

export function batch(fn: () => void): void {
    batchDepth++;
    try {
        fn();
    } finally {
        batchDepth--;
        if (batchDepth === 0) {
            flushEffects();
        }
    }
}

function flushEffects(): void {
    const effects = [...pendingEffects];
    pendingEffects.clear();
    for (const effect of effects) {
        effect.run();
    }
}

/**
 * Optional global hook invoked whenever a render effect *re-runs* (i.e. updates
 * the DOM after the initial render), tagged with the effect's `owner`. The
 * component facade uses this to schedule a `renderedCallback` once per update
 * cycle, emulating LWC's per-render lifecycle contract on top of fine-grained
 * effects.
 */
let onEffectRerun: ((owner: OwnerHandle | null) => void) | null = null;
export function setOnEffectRerun(fn: ((owner: OwnerHandle | null) => void) | null): void {
    onEffectRerun = fn;
}

// Hooks to raise/lower the facade's `globalIsUpdatingTemplate` flag around a
// binding effect's RE-RUN (not its first run). engine-core sets
// `isUpdatingTemplate` while re-evaluating the template so a reactive mutation
// made inside a binding getter (e.g. `get myClass(){ this.foo='x'; ... }`) is
// reported as a "Updating the template has side effects" dev error. Vapor's
// binding effects re-run standalone (outside renderTemplate), so the flag must
// be raised here for parity. Dev-only; owner-gated by the facade.
let onTemplateUpdateStart: ((owner: OwnerHandle | null) => void) | null = null;
let onTemplateUpdateEnd: ((owner: OwnerHandle | null) => void) | null = null;
export function setTemplateUpdateHooks(
    start: ((owner: OwnerHandle | null) => void) | null,
    end: ((owner: OwnerHandle | null) => void) | null
): void {
    onTemplateUpdateStart = start;
    onTemplateUpdateEnd = end;
}

/** The instance that owns render effects created during its template execution. */
let currentOwner: OwnerHandle | null = null;
export function setCurrentOwner(owner: OwnerHandle | null): OwnerHandle | null {
    const prev = currentOwner;
    currentOwner = owner;
    return prev;
}

export function getCurrentOwner(): OwnerHandle | null {
    return currentOwner;
}

// A SECONDARY owner to also notify when an effect re-runs. Scoped-slot content
// belongs to the parent (its primary owner), but it is rendered into the CHILD's
// subtree — so when the slot body re-renders, both the parent's and the child's
// renderedCallback must fire. createSlot sets this to the child while invoking the
// slot body, so effects created there carry the child as their co-owner.
let currentCoOwner: OwnerHandle | null = null;
export function setCurrentCoOwner(owner: OwnerHandle | null): OwnerHandle | null {
    const prev = currentCoOwner;
    currentCoOwner = owner;
    return prev;
}
export function getCurrentCoOwner(): OwnerHandle | null {
    return currentCoOwner;
}

// FOR-ITEM fan-out exclusion (perf): while a `for:each` row body renders, its
// direct per-row bindings (`{item.foo}`, className, etc.) are the fine-grained
// effects that already re-run precisely when their own dep changes. Registering
// them into the owner's whole-template set makes every unrelated notify fan out
// across ALL N rows (O(N) per notify → O(N^2) for a broadcast like `selected`),
// which is the dominant krausest regression. We suppress *fan-out membership* for
// these effects WITHOUT touching their lifecycle `owner` (renderedCallback still
// fires correctly). `forItemOwner` is the list-owning component captured on entry:
// a NESTED child component created inside the row sets its own `currentOwner`, so
// its bindings (owner !== forItemOwner) still register for whole-template parity.
// The 7 whole-template parity tests (observed-fields, scoped-slot reactivity,
// side-effects) contain NO for-rows, so excluding row bindings cannot regress them.
let forItemDepth = 0;
let forItemOwner: OwnerHandle | null = null;
export function runAsForItem<T>(fn: () => T): T {
    const prevDepth = forItemDepth;
    const prevOwner = forItemOwner;
    forItemDepth++;
    forItemOwner = currentOwner;
    try {
        return fn();
    } finally {
        forItemDepth = prevDepth;
        forItemOwner = prevOwner;
    }
}

export function renderEffect(fn: EffectFn, deferrable = false): void {
    const effect = new ReactiveEffect(fn);
    effect.owner = currentOwner;
    effect.deferrable = deferrable;
    // WHOLE-TEMPLATE RE-RENDER (engine-core parity): register this effect on its owning
    // component so that ANY tracked mutation of the component re-runs ALL its render
    // effects (engine-core marks the vm dirty and its rehydration re-reads every
    // binding), not just the fine-grained effect subscribed to the changed value. This
    // is what makes `{complexValue.name}` reflect a deep mutation after an unrelated
    // `simpleValue` change (observed-fields), and a `render()` re-invoke on any prop
    // change (side-effects). Owner-less effects (perf bench) are never registered.
    //
    // EXCEPTION: a for:each row's OWN bindings (forItemDepth > 0 and owned by the list's
    // component, not a nested child) are excluded from fan-out membership — they stay
    // fully fine-grained so a broadcast field change re-runs only the effects that read
    // it, not all N rows. Their lifecycle `owner` is preserved above for renderedCallback.
    const excludeFromFanout =
        WHOLE_TEMPLATE_RERENDER && forItemDepth > 0 && effect.owner === forItemOwner;
    if (effect.owner && !excludeFromFanout) {
        let set = ownerEffects.get(effect.owner);
        if (!set) ownerEffects.set(effect.owner, (set = new Set()));
        set.add(effect);
        effect.registeredOwner = effect.owner;
    }
    const coOwner = currentCoOwner;
    let firstRun = true;
    const wrapped = () => {
        if (!firstRun && onTemplateUpdateStart) {
            onTemplateUpdateStart(effect.owner);
            try {
                fn();
            } finally {
                if (onTemplateUpdateEnd) onTemplateUpdateEnd(effect.owner);
            }
        } else {
            fn();
        }
        if (!firstRun && onEffectRerun) {
            // Notify the co-owner FIRST (the child whose subtree hosts the slot),
            // then the primary owner (the parent that owns the binding) — matching
            // LWC's child-before-parent renderedCallback order for scoped slots.
            if (coOwner && coOwner !== effect.owner) onEffectRerun(coOwner);
            onEffectRerun(effect.owner);
        }
        firstRun = false;
    };
    // Replace the effect's fn with the wrapper (so re-runs notify the hook).
    (effect as unknown as { fn: EffectFn }).fn = wrapped;
    effect.run();
    // Register the effect DIRECTLY on the active scope (avoids a per-effect
    // `() => effect.stop()` cleanup closure — ~3/row on a for:each mount). Falls
    // back to onScopeDispose when there's no active scope (identical behavior).
    const scope = getActiveScope();
    if (scope) {
        scope.registerEffect(effect);
    } else {
        onScopeDispose(() => effect.stop());
    }
}

export function getCurrentEffect(): ReactiveEffect | null {
    return currentEffect;
}
