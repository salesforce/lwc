# Vapor Async/Batched Render Parity — Reference & Plan

Goal: make vapor's re-render scheduling match engine-core's **async, microtask-batched
rehydration** so the customer-facing lifecycle/reactivity tests pass. The integration
tests are engine-core's own spec; once vapor matches the scheduling contract they pass
without modification.

---

## 1. How engine-core schedules re-renders (the contract to replicate)

Source: `packages/@lwc/engine-core/src/framework/vm.ts` + `component.ts` + `mutation-tracker.ts`.

### 1a. Mutation → dirty → scheduled (NOT rendered synchronously)

- A component renders inside a **template reactive observer** (`vm.tro`). Reads during
  render subscribe the tro to those reactive keys (`componentValueObserved`).
- A tracked mutation (`componentValueMutated` → `valueMutated`) **notifies the tro**.
- The tro callback (`component.ts getTemplateReactiveObserver`) does ONLY:
    ```js
    if (!vm.isDirty) {
        markComponentAsDirty(vm);
        scheduleRehydration(vm);
    }
    ```
    → it sets `isDirty = true` and **queues** the vm. It does **NOT** render now.

### 1b. scheduleRehydration (vm.ts:890)

```js
export function scheduleRehydration(vm) {
    if (!IS_BROWSER || vm.isScheduled) return; // dedupe: once per vm per tick
    vm.isScheduled = true;
    if (rehydrateQueue.length === 0) addCallbackToNextTick(flushRehydrationQueue); // 1 microtask
    rehydrateQueue.push(vm);
}
```

- `addCallbackToNextTick` = `Promise.resolve().then(...)` (a microtask).
- The queue is **module-global**; the FIRST schedule in a tick arms ONE microtask; all
  subsequent schedules in the same tick just push to the queue.

### 1c. flushRehydrationQueue (vm.ts:658) — the batch

```js
const vms = rehydrateQueue.sort((a, b) => a.idx - b.idx); // PARENT-BEFORE-CHILD (idx = creation order)
rehydrateQueue = [];
for (const vm of vms) {
    if (!DISABLE_DETACHED_REHYDRATION || vm.state === VMState.connected) {
        // <-- KEY
        rehydrate(vm);
    }
}
```

- **THE KEY INSIGHT**: the connected check is at **FLUSH time, not schedule time**. A vm
  that was mutated then DISCONNECTED before the microtask runs is in the queue but is
  **SKIPPED** at flush (`vm.state !== connected`) → no re-render, no child mount, no extra
  cc/rc/dc. This is exactly what vapor gets wrong by reconciling synchronously.
- `rehydrate(vm)` only does work `if (vm.isDirty)` → renderComponent + patchShadowRoot,
  then clears dirty.
- vms processed in **idx (creation) order = parent before child**.

### 1d. markComponentAsDirty (vm.ts ~775 region) — `vm.isDirty = true`. A clean vm whose

dirty flag is already set won't re-schedule (the `if (!isDirty)` guard in the tro callback).

### 1e. disconnect sets dirty + disconnected (vm.ts ~779)

On disconnect: `vm.isDirty = true` (so a later reconnect re-renders) and
`vm.state = VMState.disconnected`. Combined with 1c, a mutate-while-connected then
disconnect → queued, but flush skips it (disconnected) → the scheduled rehydration is
silently dropped. On RECONNECT, engine-core re-renders because isDirty is true — BUT for
the lifecycle tests with native CE lifecycle, reconnect uses connectedCallback only (the
pending rehydration is what would have fired rc; since it was dropped, reconnect rc is
suppressed — which vapor already approximates via `pendingRehydrationRc`, CM40).

### 1f. Initial mount is SYNCHRONOUS

`connectRootElement` / first render happen synchronously (appendChild → cc → render → rc
before appendChild returns). Only POST-mount re-renders are async/batched.

---

## 2. How vapor schedules today (the gap)

Source: `engine-vapor/src/renderEffect.ts`, `reactivity.ts`, `createFor.ts`, `createIf.ts`,
`compat/lightning-element.ts`.

- Vapor is **fine-grained**: each binding/`createIf`/`createFor` is its own
  `ReactiveEffect`. A mutation calls `trigger(dep)` which **synchronously** runs every
  subscribed effect (`effect.notify()` → `effect.run()` immediately; `batchDepth` is only
    > 0 inside the rarely-used `batch()` helper).
- So `this.items.push(x)` synchronously reconciles the `for:each` and mounts new children
  RIGHT THEN — before the next statement (e.g. `removeChild`) runs. engine-core would have
  deferred it to the microtask, where the subsequent disconnect cancels it.
- renderedCallback IS already microtask-coalesced (`scheduleRenderedCallback` /
  `flushRenderedCallbacks` in lightning-element.ts) — but the DOM MUTATIONS themselves are
  synchronous. That mismatch is the root of the lifecycle failures.

### Customer-facing tests this gap causes (from the audit):

- lifecycle-callbacks: reorder (×2), child-mutation/scheduled-rehydration (×2)
- light-dom/lifecycle: disconnect ordering (some)
- callback-invocation-order #3827
- scoped-slot/reactivity (if:true leak), scoped-slot/rehydration-w-12965122 (×4)
- reactivity/scheduled-rehydration
- events/memoization (mixed/list), wire/legacy-adapters (config dedup)
- rendering/side-effects external (×2)

---

## 3. The refactor: microtask-batched effect flush

The minimal, surgical change that matches the contract WITHOUT rewriting the fine-grained
model:

### 3a. Defer effect re-runs to a microtask-batched queue

In `renderEffect.ts`, change `ReactiveEffect.notify()` so that a POST-initial-run notify
does NOT call `this.run()` synchronously. Instead it enqueues the effect into a global
`pendingEffects` set and arms ONE microtask (`Promise.resolve().then(flush)`) the first
time the queue goes non-empty in a tick. The flush:

1. snapshots + clears the queue,
2. sorts by owner depth/idx (parent-before-child, matching engine-core's idx sort),
3. for each effect: SKIP if its owning instance is disconnected (the flush-time connected
   check — engine-core 1c), else `effect.run()`.
4. re-arm if the flush produced new pending effects (coalesce, bounded by a cycle cap).

Initial runs (the `renderEffect(fn)` first `effect.run()`, and createFor/createIf first
render) stay SYNCHRONOUS — only re-notifications defer.

### 3b. Connected check at flush

Each effect's `owner` is the VaporInstance. At flush, skip effects whose
`owner.disconnected === true` (and don't re-run them). This gives the
mutate→disconnect→drop behavior (engine-core 1c) for free.

### 3c. Dedupe + ordering

- A Set dedupes multiple notifies of the same effect in a tick (engine-core's
  `vm.isScheduled`).
- Sort the flush by `owner` creation idx so parents flush before children.

### 3d. Keep renderedCallback flush AFTER the effect flush

The existing `flushRenderedCallbacks` should run after the DOM-mutation flush in the same
microtask drain, so rc fires once per batch, child-before-parent (already implemented).

---

## 4. RISK & GATING

- **Biggest risk**: tests/components that read the DOM SYNCHRONOUSLY after a mutation
  (no `await`) will now see stale DOM. Engine-core's own tests `await` before asserting
  (they were written for async), so the `test/**` suite should be fine. The CURATED
  `test-vapor/**` suite (24) may have a few sync-read assertions needing an `await`.
- **Perf**: the krausest bench drives createFor/renderEffect directly (not via the
  component facade) — if batching is at the ReactiveEffect.notify level it WILL affect the
  bench. Must re-measure; may need the bench to flush explicitly, or scope batching to
  component-owned effects only.
- **Infinite-loop guard**: keep a bounded cycle count in the flush (engine-core throws
  after N self-perpetuating cycles).
- **GATE**: fast gate (78s, exclude mutation-logging) after each step; compare the
  failure SET (not just count) for zero-regression; perf bench after.

### Rollout order (each gated):

1. Add the deferred flush plumbing in renderEffect.ts behind a flag `ENABLE_ASYNC_RERENDER`
   defaulted OFF. Verify zero change with flag off.
2. Turn ON for component-template effects only (binding effects whose owner is a
   VaporInstance). Measure full gate + perf.
3. Extend to createFor/createIf re-notifies. Measure.
4. Add flush-time connected-skip. Measure the lifecycle cluster.
5. Tune ordering (idx sort) + cycle cap. Final gate + perf + curated.

If any step is net-negative and not tunable, revert that step (flag off) and document.

---

## 5b. CORRECTION (measured 2026-07-01) — the Vue-parity async model is VIABLE (50 → 52, NOT 952)

**The section-5 "Experiment A → 80→952" conclusion below was WRONG. It was measured with a
FLAWED implementation that deferred INITIAL-mount runs too.** Re-implemented correctly to
match Vue Vapor exactly — defer ONLY post-initial-run re-notifies, keep initial mount
SYNCHRONOUS (Vue does the same: `renderEffect` runs `effect.run()` directly on creation,
only `notify()` calls `queueJob`) — the real impact is **50 → 52 failing**, not 50 → 952.

How (committed to `vapor-checkpoint`): `RenderEffect.notify()` defers EVERY render effect
(bindings + structural) to the shared `asyncQueue`/`flushAsyncQueue` when the owner is
already mounted (flags `setEnableAsyncRerender(true)` + `setVueParityAsync(true)`). The
naive switch was 50→58 (+8); the +8 were solved, not reverted:

- **iteration reorder (4)**: `runWithSyncNotify` around createFor's reused-item ref updates
  so per-item index/value bindings flush synchronously as ONE reconcile unit before block
  MOVES (a move fires dc/cc that would strand a deferred binding). Vue gets this free — a
  component is one update job.
- **lifecycle connect/mutate/disconnect/reconnect (2)**: a queued re-render dropped at flush
  because its owner disconnected now marks `pendingRehydrationRc` via
  `onEffectDroppedWhileDisconnected`, so reconnect suppresses its rc.
- **self-trigger loop**: `notify()` no-ops if the effect is already running (a getter with a
  `this._n++` side-effect the template reads — was spinning to the cycle cap). Matches Vue's
  default no-recurse.

**Net: 50 → 52. Composition:** +1 genuinely-fixed user-facing sticky test (W-12965122
rehydration element-LEAK — a Group-B cross-component slot-reactivity case) traded for −3
dev-profiler/COUNT regressions (performance-timing nested-rerender span count, profiler
activate-children, scheduled-rehydration detached getter count — all sensitive to the number
of render passes, which batching legitimately changes; NOT broken rendering). Perf intact
(swap 10.5×, remove 6.0× — the krausest bench's owner-less createFor never defers).

**KEY DISTINCTION this experiment proved:** "async/batching" and "whole-template re-render"
are DIFFERENT changes, previously conflated. The async model batches WHEN the existing
fine-grained effects run (fixing timing/ordering/leak-class tests) but does NOT change WHICH
effects run — so it does NOT fix the whole-template-rerender class:

- STILL failing (need whole-template re-render, i.e. re-invoke render() + re-read ALL
  bindings): observed-fields ×2, side-effects-external ×2, memoization ×1, wire-dedup ×1,
  scoped-slot rehydration ×3. Deferring a `complexValue` binding doesn't make a `simpleValue`
  change re-run it.
- FIXED / fixable by async: the timing/ordering/leak/reconnect class (W-12965122 leak;
  lifecycle reconnect; the earlier scoped-async lifecycle wins).

Remaining 3 regressions are profiler-span/count coalescing (one flush = one rerender tick);
a first single-flush-span attempt mis-nested the spans (made perf-timing worse) and was
reverted. Solvable but it's profiler-span-plumbing detail.

**Revised recommendation:** the async model is a legitimate, low-regression foundation — keep
it (behind the flags, now ON) and (a) coalesce profiler spans to one-per-flush to clear the 3
count regressions, then (b) pursue whole-template re-render SEPARATELY (per-component opt-in)
for the observed-fields/side-effects class. The two are independent levers.

---

## 5. EMPIRICAL RESULTS (measured, 2026-06-29) — [SUPERSEDED — see §5b above; this experiment was flawed]

Plumbing implemented (`renderEffect.ts`: `ENABLE_ASYNC_RERENDER` flag, `asyncQueue`,
microtask `flushAsyncQueue` with parent-before-child idx sort + flush-time
disconnected-skip; facade hooks `setAsyncRerenderHooks`; per-effect `deferrable`). Kept in
the tree behind the flag (default OFF) for future use, but NOT enabled.

**Experiment A — GLOBAL async (every effect re-notify deferred): 80 → 952 failed.**
[⚠️ FLAWED — this deferred INITIAL-mount runs too; the correct model is 50→52, see §5b.]
Catastrophic. The integration suite overwhelmingly reads the DOM SYNCHRONOUSLY after a
mutation (`elm.x = v; expect(dom)…`). That works on vapor because vapor's fine-grained
update is synchronous. engine-core's tests `await` only where engine-core defers a
WHOLE-component rehydration — but vapor updates a single text/attr binding where
engine-core would re-render the whole template, and those fine-grained updates are
observed immediately by the suite. Deferring them all breaks ~870 assertions.

**Experiment B — SCOPED async (only the createFor reconcile deferred, `deferrable=true`):
80 → 86 failed.** Still net-negative (+6) AND did NOT fix the target lifecycle tests
(child-mutation/reorder), because those mutate a list deeper than the disconnecting
component's own top-level `for:each`, while breaking sync-read `for:each` tests +
scoped-slot reorder.

### Verdict

vapor's **synchronous fine-grained** model is structurally relied upon by the test suite
(and by the perf profile). Async/batched rendering is NOT a drop-in scheduling toggle; it
would require simultaneously: (a) deferring the right subset of effects, (b) auditing/
updating every sync-read assertion in BOTH the engine-core suite and curated suite, and
(c) re-proving the perf numbers. That is a multi-week, coordinated engine+test effort with
a product decision behind it — NOT an incremental parity fix. The ~13 lifecycle-timing +
several reactivity-timing failures are the _observable symptom_ of this divergence; they
should be triaged as a known architectural gap, not chased individually (each individual
attempt — owner-fallback, stopScope, mutatedWhileDisconnected, scoped-async — has been
measured net-negative or inert).

The 2 reconnect-timing tests fixable WITHOUT async were already landed (CM40
`pendingRehydrationRc`). The remaining lifecycle/timing tests need the full async model.

**Experiment C — MOUNT-GATED deferred createFor (defer reconcile only when owner
isMounted, with flush-time disconnected-skip): regressed lifecycle-callbacks 4→8.**
Root cause discovered: vapor has TWO uncoordinated microtask queues — the new async
effect-flush (`flushAsyncQueue` in renderEffect.ts) AND the existing renderedCallback
flush (`flushRenderedCallbacks` in lightning-element.ts, armed via `scheduleRenderedCallback`
from the `onEffectRerun` hook). When a deferred reconcile runs inside the async flush, its
`onEffectRerun` arms the rc-flush as a SEPARATE later microtask, so the cc/rc ordering and
coalescing relative to the reconcile get scrambled (the `connect/mutate-child` and
`connect/disconnect-child/mutate-child` orderings broke).

### REVISED VERDICT (after 3 measured async experiments + 2 earlier)

The required refactor is NOT "defer some effects" — it is to UNIFY vapor's two microtask
queues into ONE ordered single-pass cycle matching engine-core's `flushRehydrationQueue`:
within one microtask, drain the structural-reconcile queue (idx-sorted, skip disconnected),
THEN drain the renderedCallback queue, as one coordinated pass — and ensure a child mounted
during a reconcile fires its cc/rc inline at the right point. That touches the scheduler,
the rc-flush, the effect model, AND requires re-validating the ~3200 sync-read assertions
(many of which pass only because vapor is synchronous) + the perf bench. It is a multi-day
coordinated engine+test rewrite with a product decision behind it (does vapor commit to
engine-core's async-render observable contract?), NOT an incremental fix landable in a
gated iterative loop. Every piecemeal attempt has been measured net-negative; the plumbing
is left behind `setEnableAsyncRerender(false)` for whoever takes on the unification.

The customer-facing symptom (lifecycle timing/ordering ~11 tests) should be tracked as a
single known architectural gap with this doc as its design reference, not chased per-test.
