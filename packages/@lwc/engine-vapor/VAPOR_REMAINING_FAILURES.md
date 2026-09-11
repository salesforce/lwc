# Vapor Mode — Remaining WTR Failures: Fix Plan (grouped by remediation)

As of 2026-07-01: **3248 passed / 50 failed / 1169 skipped** (full WTR suite under vapor,
excluding the pre-existing `profiler/mutation-logging` hang) at the SYNCHRONOUS baseline.
With the Vue-parity async model now enabled (see banner + ASYNC_RENDER_PARITY.md §5b):
**3246 passed / 52 failed** (+1 sticky fix, −3 profiler-count regressions). 36 distinct
`it()` cases (some parameterized run 2–4×). Paths are relative to
`packages/@lwc/integration-wtr/`.

Tests are grouped by the **single remediation** that would fix the whole group. Each group has a
**scope / risk** note, then per-test file links, exact names, and the explicit fix step.

> 🔄 **UPDATE 2026-07-01 — Vue-parity ASYNC model implemented (`vapor-checkpoint`, see
> ASYNC_RENDER_PARITY.md §5b).** Vapor now defers every render effect's post-initial-run
> re-notify to a shared microtask-batched queue (Vue Vapor's `notify → queueJob`), initial
> mount synchronous. This **corrects the old "80→952" claim** — that experiment was flawed
> (it deferred initial-mount runs too); the correct model measured **50 → 52**.
>
> **Effect on the sticky tests below: exactly ONE flipped** — Group B's
> `W-12965122 … Elements are not leaked` (the element-LEAK case). The other 30 documented
> tests STILL fail. Reason: async batching changes WHEN the existing fine-grained effects
> run, not WHICH run — it does NOT provide **whole-template re-render** (re-invoke render() +
> re-read ALL bindings). That is a SEPARATE lever. So the groups split cleaner than first
> written:
>
> - **Async ALONE fixes** (timing / ordering / leak / reconnect class): the W-12965122 leak;
>   the lifecycle reconnect/reorder wins landed earlier.
> - **Async does NOT fix — needs whole-template re-render** (Group A entirely + the
>   count-based half of Group B): observed-fields, side-effects-external, memoization,
>   wire-dedup, scoped-slot rehydration render-COUNTS. Deferring a `complexValue` binding
>   never makes a `simpleValue` change re-run it.
>   Cost of enabling async: 3 NEW dev-profiler/COUNT regressions (performance-timing span
>   count, profiler activate-children, scheduled-rehydration getter count) — not broken
>   rendering; the render-pass count shifts under batching. Solvable via one-span-per-flush
>   profiler coalescing.

> ⚠️ **Cross-group constraint (REVISED):** Group A (and the count-half of B) need engine-core's
> **whole-template re-render** — this is NOT the same as the async/batching switch (which is now
> done and cheap). Whole-template re-render re-invokes `render()` and re-reads every binding on
> any tracked change; doing THAT globally is what risks the sync-read passing tests. It must be
> **opt-in / scoped** per component. The async model is a safe foundation; whole-template
> re-render is the remaining, riskier lever for ~13 of these.

---

## GROUP A — Fine-grained → scoped whole-template re-render (7 failures)

**Fix (shared):** Introduce a per-component "dirty → re-run render()" path that re-evaluates ALL
of a component's bindings when any tracked field changes (engine-core's `markComponentAsDirty` +
async rehydration), gated so it applies only to components that need whole-template semantics.
Concretely: add an optional per-instance flag (e.g. `instance.wholeTemplateRerender`) that, when a
tracked dep fires, schedules one microtask re-run of the component's render function instead of
(or in addition to) the individual binding effect. Batch multiple synchronous prop writes into
one flush.
**Scope:** engine-vapor `renderEffect`/instance scheduling + a compiler or runtime opt-in signal.
**Risk:** HIGH — this is the 80→952 change if done globally. Must be scoped + measured per component.

- [test/component/observed-fields/index.spec.js#L41](../integration-wtr/test/component/observed-fields/index.spec.js#L41) — `observed-fields > should not rerender component when field value is mutated`
  **Fix:** on the `simpleValue` change, re-run the whole template so the `complexValue.name`
  binding re-reads the (already-mutated) object and shows `mutated name-mutated lastName`.

- [test/component/observed-fields/index.spec.js#L57](../integration-wtr/test/component/observed-fields/index.spec.js#L57) — `observed-fields > should have same behavior as an expando field when has side effects during render`
  **Fix:** invoke `render()` exactly once per whole-component re-render so the in-`render()`
  counter matches engine-core; requires the whole-template pass above.

- [test/rendering/side-effects/index.spec.js#L60](../integration-wtr/test/rendering/side-effects/index.spec.js#L60) — `side effects > logs error for side effect on external component during render`
  **Fix:** on any tracked prop change (`elm.bar = 1`), re-invoke `render()` even if no binding
  read `bar`; the dev side-effect detector (already present) will then fire for the `baz` mutation.

- [test/rendering/side-effects/index.spec.js#L88](../integration-wtr/test/rendering/side-effects/index.spec.js#L88) — `side effects > logs error for side effect on external component during template updating`
  **Fix:** same — force a `render()` re-invocation on the prop change during template updating.

- [test/events/memoization/index.spec.js#L54](../integration-wtr/test/events/memoization/index.spec.js#L54) — `deep listener > does redefine onClick … but not the onChange for a single deep listener`
  **Fix:** batch consecutive synchronous prop writes (`elm.loggers=…; elm.mainLogger=…`) into ONE
  async render so `mainLogger.onChange` is read after both writes land (not after only the first).

- [test/wire/legacy-adapters/index.spec.js#L130](../integration-wtr/test/wire/legacy-adapters/index.spec.js#L130) — `legacy wire adapters (register call) > … should not call config when the generated config is the same as the last one (case 1)`
  **Fix:** batch the two prop writes into one render pass so the wire config is computed once from
  the final state (config identity preserved, `update` not re-called on the transient value).

- [test/act/index.spec.js#L318](../integration-wtr/test/act/index.spec.js#L318) — `ACTCompiler > property reference and events`
  **Fix:** make the ACT VDOM-compat `$api` render path re-render its template on nested-prop
  mutation (same whole-template mechanism, applied to the act-compat shim).

---

## GROUP B — Cross-component / cross-render slot reactivity (10 failures)

**Fix (shared):** When a component's slot content depends on reactive state owned by another
component (parent-provided content, or a forwarding intermediary), the receiving/terminal slot
must re-evaluate when that state changes. Implement engine-core's "re-allocate slots on child
re-render": when slotted content changes, mark the receiving child dirty and re-run its slot
resolution (which re-runs the fallback-vs-content decision and re-projects forwarded content).
Requires Group A's whole-child re-render as its substrate, PLUS making light-DOM slot resolution
(`resolveLightDomSlots`, currently one-shot at mount) re-runnable, and making a terminal
`createSlot` subscribe to its forwarded content's emptiness.
**Scope:** engine-vapor `slot.ts` (`createSlot`) + `resolveLightDomSlots` + slotset re-allocation.
**Risk:** HIGH — depends on Group A; touches the slot subsystem the passing slot tests rely on.

- [test/light-dom/slotting/index.spec.js#L118](../integration-wtr/test/light-dom/slotting/index.spec.js#L118) — `Slotting > should render default content in forwarded slots`
  **Fix:** when the consumer's `lwc:if` empties forwarded content, re-run the terminal
  `<x-light-container>` slots so they render their own fallback (make the terminal `createSlot`
  react to its forwarded content becoming empty → render `fallback()`).

- [test/light-dom/slot-fowarding/slots/reactivity/index.spec.js#L230](../integration-wtr/test/light-dom/slot-fowarding/slots/reactivity/index.spec.js#L230) — `light DOM slot forwarding reactivity > should update correctly for lightLight slots`
  **Fix:** make light-DOM slot resolution re-runnable so a dynamic forwarding-name change
  (`<slot slot={upperSlot}>`) re-projects the chain (currently resolved once at mount).

- [test/light-dom/slot-fowarding/slots/reactivity/index.spec.js#L230](../integration-wtr/test/light-dom/slot-fowarding/slots/reactivity/index.spec.js#L230) — `light DOM slot forwarding reactivity > should update correctly for lightShadow slots`
  **Fix:** same re-runnable resolution, light→shadow variant.

- [test/light-dom/slot-fowarding/slots/reactivity/index.spec.js#L230](../integration-wtr/test/light-dom/slot-fowarding/slots/reactivity/index.spec.js#L230) — `light DOM slot forwarding reactivity > should update correctly for shadowLight slots`
  **Fix:** same re-runnable resolution, shadow→light variant.

- [test/light-dom/scoped-slot/reactivity/index.spec.js#L73](../integration-wtr/test/light-dom/scoped-slot/reactivity/index.spec.js#L73) — `reactivity in scoped slots > <slot> tag with key attribute: rerenders slotted content only when iteration key changes`
  **Fix:** implement keyed re-allocation of scoped-slot content (re-create on key change, reuse
  otherwise) with whole-child re-render so per-item `renderedCallback` counts match.

- [test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L25](../integration-wtr/test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L25) — `Should clean up content between rehydration > Issue W-12965122 … not leaked when parent binding and child binding is mutated`
  **Fix:** on scoped-slot data mutation, re-render the whole child + notify the content owner so
  `slotted:rc`, `child:rc`, `parent:rc` all fire (currently only `slotted:rc`).

- [test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L79](../integration-wtr/test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L79) — `… > Should rerender when only child's value is mutated`
  **Fix:** same — whole-child re-render on `@track items[0].name` mutation.

- [test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L105](../integration-wtr/test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L105) — `… > Should rerender when child's value is mutated before parent's value is mutated`
  **Fix:** same three-component re-render sequence.

- [test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L129](../integration-wtr/test/light-dom/scoped-slot/rehydration-issue-w-12965122/index.spec.js#L129) — `… > Should rerender when child's value is mutated after then parent's value is mutated`
  **Fix:** same, after-parent-mutation ordering.

_(Also see Group C #19 — the #3827 duplicate-slot test straddles slot reactivity and node
re-creation.)_

---

## GROUP C — VDOM node re-creation vs DOM reuse (3–4 failures)

**Fix (shared):** On slot re-assignment / conditional-branch switch that changes a slotted
component's logical identity, DESTROY the old instance (fire `disconnectedCallback`) and CREATE a
new one (fire `connectedCallback`) instead of moving/reusing the DOM node. Implement an identity
key for slotted components so a changed assignment triggers unmount+remount rather than a move.
**Scope:** engine-vapor slot projection + `createFor`/`createIf` reconcile (identity-keyed).
**Risk:** HIGH — node re-creation is exactly what vapor avoids for its ~10× perf; must be scoped
to the slot-reassignment case and perf-benchmarked.

- [test/light-dom/lifecycle/index.spec.js#L224](../integration-wtr/test/light-dom/lifecycle/index.spec.js#L224) — `slot forwarding > dynamic > invokes lifecycle methods in correct order`
  **Fix:** treat a dynamic `<slot slot={topTop}>` reassignment as an identity change → unmount old
  slotted leaves (dc) + mount new ones (cc), matching engine-core's uuid/cc/dc sequence.

- [test/light-dom/lifecycle/index.spec.js#L241](../integration-wtr/test/light-dom/lifecycle/index.spec.js#L241) — `slot forwarding > dynamic > invokes disconnectedCallback after removing entire element`
  **Fix:** same identity-keyed re-creation in `setup()`, then normal removal fires the expected dc.

- [test/rendering/callback-invocation-order/index.spec.js#L370](../integration-wtr/test/rendering/callback-invocation-order/index.spec.js#L370) — `regression test (#3827) > light DOM should maintain callback invocation order for duplicate slots across conditional branches …`
  **Fix:** when a conditional with a duplicate `<slot>` per branch switches, create the new
  branch's slotted leaf then tear it down (fire the extra `disconnectedCallback`) instead of
  reusing the node — replicating engine-core's duplicate-key diff.

---

## GROUP D — Slot-forwarding bookend / vnode ordering (2 failures)

**Fix (shared):** Match engine-core's ordering of a slot group's contents: STATIC vnodes
(`api_static_fragment`) are emitted before DYNAMIC text/comment content, and each forwarding level
contributes its own comment-bookend pair. Adjust the forwarding-slot content assembly so the
default-slot group orders `[static <p>, text, comment]` (engine-core) and the per-level bookend
count matches.
**Scope:** engine-vapor `createSlot` forwarding assembly + bookend emission.
**Risk:** MEDIUM — must not disturb the passing `should forward slots` / `should render default
content` string-exact assertions; isolated to forwarding ordering.

- [test/light-dom/slot-fowarding/slots/forwarding/index.spec.js#L63](../integration-wtr/test/light-dom/slot-fowarding/slots/forwarding/index.spec.js#L63) — `slot forwarding > should correctly forward slot assignments - light > light slot`
  **Fix:** reorder the default-slot group so the static `<p>` precedes the forwarded text/comment
  (text lands at `childNodes[12]`, not 9). Element order is already correct.

- [test/light-dom/slot-fowarding/slots/forwarding/index.spec.js#L63](../integration-wtr/test/light-dom/slot-fowarding/slots/forwarding/index.spec.js#L63) — `slot forwarding > should correctly forward slot assignments - shadow > light slot`
  **Fix:** emit the missing per-forwarding-level comment bookend so the node count is 3 not 2
  (shadow-parent variant of the same ordering fix).

---

## GROUP E — Per-branch scoped/standard slot typing (2 failures)

**Fix (shared):** A slot fn built from a mixed conditional (one branch standard `<span>`, another
scoped `<template lwc:slot-data>`) must NOT be statically tagged `scopedSlot` for the whole group.
Instead, determine scoped-vs-standard per ACTIVE branch at render time: the compiler should mark
the fn as "conditionally scoped," and the runtime slot-type-mismatch check
(`isScopedSlot !== slotFn.scoped`) should evaluate against what the active branch actually renders.
**Scope:** template-compiler-vapor scoped-detection + engine-vapor `slot.ts` mismatch check.
**Risk:** MEDIUM — localized to scoped-slot; must keep the existing scoped-slot tests green.

- [test/light-dom/scoped-slot/if-block/index.spec.js#L16](../integration-wtr/test/light-dom/scoped-slot/if-block/index.spec.js#L16) — `if-block > should work when parent and child have matching slot types`
  **Fix:** when `showStandard` is active, the standard `<slot>` must accept the standard branch's
  `<span>` content (no false mismatch); per-branch scoped typing renders it correctly.

- [test/light-dom/scoped-slot/if-block/index.spec.js#L34](../integration-wtr/test/light-dom/scoped-slot/if-block/index.spec.js#L34) — `if-block > should throw error when parent and child have mismatched slot types`
  **Fix:** fire the mismatch error exactly once, at the branch transition where the ACTIVE parent
  and child types genuinely conflict — not statically for the whole group.

---

## GROUP F — errorCallback via swallowed custom-element reactions (5 failures)

**Fix (shared):** A child mounted synchronously inside a toggled-on `lwc:if` branch fires its
native `connectedCallback` reaction, whose throw the browser swallows to `window.onerror`. Route
these to the boundary WITHOUT the current conflict: change conditional-content child mounting so
the mount runs OUTSIDE the CE reaction (e.g. construct+mount the child via vapor's deferred-child
path even inside conditional content, so the existing `handleErrorSelfOrAncestor` catch applies),
AND keep a re-entrancy guard so a boundary's OWN errorCallback re-throw still propagates as a
callback-reaction error.
**Scope:** engine-vapor conditional-content mount path (`block.ts` updateAnchorless / createIf) +
`create-element.ts` deferred-child error routing.
**Risk:** MEDIUM-HIGH — prior broad-routing attempts satisfied one sub-case but broke the other;
needs the mount-path change so a SINGLE mechanism handles both primary and secondary throws.

- [test/component/LightningElement.errorCallback/index.spec.js#L146](../integration-wtr/test/component/LightningElement.errorCallback/index.spec.js#L146) — `error boundary > should fail to unmount alternative offender when root element is not a boundary`
  **Fix:** ensure the primary child throw reaches the boundary's `errorCallback` (route via the
  deferred-child catch), so the offender is retained per the boundary's recovery.

- [test/component/LightningElement.errorCallback/index.spec.js#L291](../integration-wtr/test/component/LightningElement.errorCallback/index.spec.js#L291) — `errorCallback throws after value mutation > … when child throws in connectedCallback`
  **Fix:** let the boundary's SECONDARY errorCallback throw propagate as a callback-reaction error
  (re-entrancy guard so it isn't re-routed into a loop).

- [test/component/LightningElement.errorCallback/index.spec.js#L291](../integration-wtr/test/component/LightningElement.errorCallback/index.spec.js#L291) — `… when child throws in constructor`
  **Fix:** same secondary-throw propagation (constructor variant).

- [test/component/LightningElement.errorCallback/index.spec.js#L291](../integration-wtr/test/component/LightningElement.errorCallback/index.spec.js#L291) — `… when child throws in render`
  **Fix:** same (render variant).

- [test/component/LightningElement.errorCallback/index.spec.js#L291](../integration-wtr/test/component/LightningElement.errorCallback/index.spec.js#L291) — `… when child throws in renderedCallback`
  **Fix:** same (renderedCallback variant).

---

## GROUP G — Reactivity-membrane `this` identity (1 failure)

**Fix:** Make the component reactivity membrane expose a SINGLE consistent `this` across dispatch:
when a public prop is redefined on the instance via `Object.defineProperty`, the redefined
setter must be invoked with the same object identity a getter's `this` returns (the proxy). Route
the host-property `set` so the redefined accessor's `this === vm.component` (proxy), or unwrap
consistently so getter and setter agree.
**Scope:** engine-vapor `lightning-element.ts` component proxy (get/set traps) + host bridge.
**Risk:** MEDIUM — core membrane; must keep the broad decorators/api + reactivity suites green.

- [test/shadow-dom/HTMLElement-properties/CustomInstanceSetter.spec.js#L6](../integration-wtr/test/shadow-dom/HTMLElement-properties/CustomInstanceSetter.spec.js#L6) — `accessing public properties defined on component > should allow redefining a public property on component instance`
  **Fix:** ensure the instance-redefined setter's `this` equals `componentInstance` (the proxy) so
  `setterContext === componentInstance`.

---

## GROUP H — slotchange for removed slot (1 failure)

**Fix:** Synthesize a `slotchange` event when a `<slot>` element with assigned nodes is removed
(e.g. via `lwc:if`). Either add a targeted MutationObserver on shadow roots (engine-core's
approach) or dispatch `slotchange` manually when vapor tears down a `<slot>` that had assigned
nodes.
**Scope:** engine-vapor shadow slot teardown.
**Risk:** LOW-MEDIUM — additive; must not double-fire with the browser's native `slotchange`.

- [test/shadow-dom/HTMLSlotElement-events/HTMLSlotElement.slotchange.spec.js#L54](../integration-wtr/test/shadow-dom/HTMLSlotElement-events/HTMLSlotElement.slotchange.spec.js#L54) — `should fire slotchange when slot is removed`
  **Fix:** dispatch `slotchange` on the slot as it's removed (or via a MutationObserver) so the
  `onslotchange` handler's count reaches 1.

---

## GROUP I — Callable `LightningElement` base (Locker interop) (1 case, 4 tag variants)

**Fix:** Make the exported `LightningElement` support `.call(obj)` (Locker/Aura `SecureBase` does
`LightningElement.call(this)`), while remaining a valid `extends` base. Options: wrap the class in
a callable Proxy (apply trap → run init on the passed `this`), or export a function whose
prototype is the class prototype (as already done for `prototype.constructor`, extended to the
top-level binding). With `DISABLE_STRICT_VALIDATION=true`, a constructor returning a blocklisted
element must not throw.
**Scope:** engine-vapor `lightning-element.ts` export shape.
**Risk:** MEDIUM — changing the base's callable-ness must not break `instanceof`/`extends` across
the suite.

- [test/component/LightningElement/index.spec.js#L105](../integration-wtr/test/component/LightningElement/index.spec.js#L105) — `should succeed when the constructor returns a blocklisted element (…) when DISABLE_STRICT_VALIDATION is true` (iframe/embed/object/script)
  **Fix:** allow `LightningElement.call(iframe)` to run init without the "cannot invoke class
  without new" throw; accept the returned foreign element under the legacy-validation flag.

---

## GROUP J — Test-harness / unimplemented features (4 failures) — NOT vapor behavior

**Fix (shared):** These need harness plumbing or an unimplemented feature, not a vapor behavior
change. Lower priority — no shipped-app impact.

- [test/api/sanitizeAttribute/index.spec.js#L47](../integration-wtr/test/api/sanitizeAttribute/index.spec.js#L47) — `sanitizeAttribute.mockReset is not a function` (+ #3 xlink:href, #4 href)
  **Fix:** make `sanitizeAttribute` injectable as a spy into the vapor bundle AND have the runtime
  call that injected instance — i.e. a vapor-aware `mocks/lwc.js` + a runtime hook (like the
  existing `setHooks`/signal-set shim). Harness-side change.

- [test/profiler/sanity/profiler.spec.js#L186](../integration-wtr/test/profiler/sanity/profiler.spec.js#L186) — `Profiler Sanity Test > hydrateComponent`
  **Fix:** implement `hydrateComponent` in vapor (hydration is currently unimplemented) and emit
  its profiler op-log. Large, separate feature.

- [test/component/native-vs-synthetic-lifecycle/index.spec.js#L101](../integration-wtr/test/component/native-vs-synthetic-lifecycle/index.spec.js#L101) — `… synthetic lifecycle after flag is lazily set`
  **Fix:** honor `DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE`: connect components synthetically (fire
  cc on append even when detached), log the dev warning, and dispatch
  `ConnectedCallbackWhileDisconnected`. Requires a synthetic-lifecycle mode in vapor.

---

## Priority / effort summary

| Group |    Failures | Fix summary                                                  | Risk     | Depends on       |
| ----- | ----------: | ------------------------------------------------------------ | -------- | ---------------- |
| A     |           7 | Scoped whole-template re-render (opt-in, batched)            | HIGH     | — (foundational) |
| B     |          10 | Re-runnable + cross-component slot re-allocation             | HIGH     | A                |
| C     |         3–4 | Identity-keyed slot re-creation (unmount+remount)            | HIGH     | —                |
| D     |           2 | Static-before-dynamic vnode + per-level bookends             | MED      | —                |
| E     |           2 | Per-branch scoped/standard slot typing                       | MED      | —                |
| F     |           5 | Route conditional-child mount errors to boundary             | MED-HIGH | —                |
| G     |           1 | Consistent membrane `this` identity                          | MED      | —                |
| H     |           1 | Synthesize slotchange on slot removal                        | LOW-MED  | —                |
| I     | 1 (×4 tags) | Callable `LightningElement` base                             | MED      | —                |
| J     |           4 | Harness spy injection / hydration / synthetic-lifecycle flag | —        | out of scope     |

**Recommended order (best ROI first, lowest risk):**

1. **D, E, G, H** — medium/low risk, self-contained, ~6 failures, no dependency on the re-render rearchitecture.
2. **F** — 5 failures, needs the conditional-mount-path change (one coherent fix).
3. **I** — 1 case / 4 tags, isolated to the base-class export.
4. **A → B** — the big one: ~17 failures, but requires the scoped whole-template re-render design (A) as the foundation for B. Must be opt-in + perf-gated (the 80→952 constraint). This is the largest, riskiest, and highest-count effort — do it last, as a dedicated project.
5. **C** — identity-keyed re-creation; perf-sensitive, do alongside/after A–B with benchmarks.
6. **J** — harness/feature work; schedule independently (hydration is a separate feature entirely).

**Hard constraint on all of the above:** every change must hold zero regressions against the 3248
passing tests and the ~10×/6× swap/remove perf benchmarks. Groups A/B/C specifically risk the
perf wins and the fine-grained-reliant passing tests, which is why they are scoped/opt-in rather
than global.
