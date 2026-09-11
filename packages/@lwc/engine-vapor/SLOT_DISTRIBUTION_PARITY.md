# Vapor Slot Distribution Parity — Reference & Plan

Covers the remaining customer-facing SLOT failures (~6–8 tests) that share ONE root
cause: **vapor distributes slotted content by a COMPILE-TIME static slot-name key,
where engine-core distributes by each content node's RUNTIME `slot` attribute /
vnode `slotAssignment` metadata.**

## Affected tests

- `rendering/dynamic-slots` — `slot={expr}` dynamic slot names render NOTHING (light DOM).
- `light-dom/slot-fowarding/slots/reactivity` — `extractDataIds` CRASHES (`elm.hasAttribute is not a function`) on stray nodes from mis-distributed dynamic-name content.
- `light-dom/slot-fowarding/slots/forwarding` "light > light" — forwarded default-slot TEXT content lost (text nodes can't carry a `slot=` attr).
- `shadow-dom/HTMLSlotElement-properties` complex `assignedNodes`/`assignedElements` — nested `<slot>`-in-`<slot>` forwarding slots not rendered (`nodes.slot2` undefined).
- `light-dom/scoped-slot/if-block` "mismatch throws" — crash when a slot's content TYPE (standard vs scoped) switches across `lwc:if`/`elseif` branches.

## Root causes (two related compiler/runtime gaps)

### Gap A — distribution is by static key, not runtime attribute

`createChildComponent(tag, Ctor, props, slotset, ...)` receives `slotset` keyed by the
STATIC slot name the compiler grouped content under. `transform.ts` groups slotted
children by their literal `slot="name"` at compile time. For `slot={expr}` (dynamic), the
compiler dumps ALL such children into the DEFAULT slot (`""`) and emits
`renderEffect(() => setProp(node, 'slot', $cmp.expr))` to set the attribute at runtime.

Then `resolveLightDomSlots` (light) resolves each `<slot name=X>` via `slotset[X]` — so a
`<slot name="upper">` finds nothing (the upper content is in `slotset[""]` with a runtime
`slot="upper"` attr). Named slots get fallback/empty; the content piles into the default.

ENGINE-CORE: `allocateInSlot` (rendering.ts) reads each child vnode's `slotAssignment`
(which IS the evaluated `slot={expr}`) at allocation time and buckets into
`cmpSlotsMapping[name]`. Distribution is fully runtime.

### Gap B — a scoped-slot template in a mixed group marks the WHOLE group scoped

`dynamic-slots/lightParent`: a child with `<p slot={a}>`, `<p slot={b}>`, AND a
`<template slot={c} lwc:slot-data>` → vapor compiles the ENTIRE default-slot group as
`scopedSlot((scoped) => ...)`. The child's plain `<slot>` then sees `.scoped` content and
logs "Mismatched slot types" → renders nothing. Standard + scoped content authored for the
same child must be grouped/tagged INDEPENDENTLY (per resolved slot name), not as one group.

## The refactor

### Runtime (light DOM) — distribute by attribute

Rework `resolveLightDomSlots` so it does TWO passes:

1. Render the parent's slot content ONCE (all of it), into a detached holder.
2. For each child `<slot name=X>` (in document order), move the content nodes whose
   resolved `slot` attribute === X (default = `''`/absent) before the slot, then drop the
   slot. Read the `slot` attribute at THIS point (after the runtime `setProp` effects ran),
   so dynamic `slot={expr}` is honored. TEXT/COMMENT nodes (no attr) always go to default.
   This replaces the current `slotset[name]()` keyed lookup with attribute bucketing.

This also fixes Gap-B text-forwarding: text nodes route to the default slot by absence of
a `slot` attr instead of being lost.

### Runtime (shadow DOM) — projectSlots by attribute

`projectSlots` already appends slotset content to the host light DOM; native `<slot name>`
projects by the element's `slot` attr — so shadow MOSTLY works IF the content carries the
right runtime `slot` attr. Verify the `setProp(slot, expr)` effects run BEFORE projection
queries; the nested-slot-in-slot (`assignedNodes` complex) case needs forwarding `<slot
slot=Y name=X>` to render as a real `<slot>` that both receives (name=X) and forwards
(slot=Y) — currently a forwarding `<slot>` is converted to createSlot and the element
vanishes, so `assignedNodes()` can't find it.

### Compiler — don't over-scope mixed groups

In `transform.ts` slot grouping: when a child's slotted content contains BOTH scoped
(`lwc:slot-data`) and non-scoped items, tag ONLY the scoped item's entry `.scoped`, keep
the rest standard. Currently the whole `""` group is wrapped in one `scopedSlot(...)`.

## RISK

- `resolveLightDomSlots` attribute-bucketing rewrite touches EVERY light-DOM slot
  (the many passing static-name slot tests). Must preserve: terminal-slot `slot=` strip
  (api>=61), fallback rendering, bookend brackets, forwarding re-tag, scoped-slot path.
- Gate per-cluster (slotting, slot-forwarding, scoped-slot, dynamic-slots, slot-not-at-top-level)
  then full gate. Revert if net-negative.
- This intersects the BOOKEND cluster (slot content bookends) — do the slot-distribution
  rework FIRST, then re-evaluate bookends, since attribute-bucketing changes the DOM shape.

## Status

NOT attempted as a full rewrite (high regression surface across passing slot tests). The
`lwc:slot-data on non-light child` dev error + scoped-slot leak (removeBlock sweep) were
landed separately. This doc is the design reference for the dedicated slot-model effort.
