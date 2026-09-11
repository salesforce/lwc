---
title: Vapor Mode (VDOM-less rendering)
status: DRAFTED
created_at: 2026-06-08
updated_at: 2026-06-08
pr: (leave this empty until the PR is created)
champion: (TBD)
---

# Vapor Mode

## Summary

Vapor Mode is an opt-in, alternative compilation and rendering strategy for LWC
that eliminates the virtual DOM. Instead of compiling templates to functions
that produce a virtual node (VNode) tree which is then diffed and patched, the
Vapor compiler emits code that creates real DOM nodes once and wraps every
dynamic binding in a fine-grained reactive effect that writes directly to the
DOM. The approach is modeled on Vue Vapor (itself inspired by Solid.js) and
adapted to LWC's component model, template syntax, and reactivity.

## Basic example

Given this template:

```html
<template>
    <button class={btnClass} onclick={handleClick}>{label}</button>
</template>
```

The **standard** LWC compiler produces a template function that returns a VNode
tree on every render, which the engine diffs against the previous tree:

```js
function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element, t: api_text, b: api_bind } = $api;
    return [
        api_element('button', {
            className: $cmp.btnClass,
            on: { click: api_bind($cmp.handleClick) },
            key: 0,
        }, [api_text($cmp.label)]),
    ];
}
```

The **Vapor** compiler produces direct DOM operations with no VNodes:

```js
import { child, delegate, delegateEvents, renderEffect, setClass, setText, template }
    from '@lwc/engine-vapor';

const t0 = template("<button> </button>");
delegateEvents("click");

export default function render($cmp, $slotset) {
    const n0 = t0();                                  // real <button>, cloned from a cached template
    const n1 = child(n0);                             // the text node
    delegate(n0, "click", e => $cmp.handleClick(e));  // one delegated listener
    renderEffect(() => setClass(n0, $cmp.btnClass));  // re-runs only when btnClass changes
    renderEffect(() => setText(n1, $cmp.label));      // re-runs only when label changes
    return n0;
}
```

When `this.label` changes, only the second effect re-runs and writes
`n1.nodeValue` directly. No tree is rebuilt, no diff is performed.

## Motivation

The virtual DOM is the dominant cost center in LWC's runtime update path. On
every change to reactive state, the engine:

1. Re-invokes the template function, allocating a fresh VNode tree.
2. Walks the new tree and diffs it against the previous tree.
3. Patches the real DOM where differences are found.

Steps 1 and 2 cost CPU and memory proportional to the **size of the template**,
not the **size of the change**. A component with 200 nodes that changes one text
value still allocates ~200 VNodes and diffs all of them. This is wasteful in the
common case where a small amount of state drives a small, localized DOM change.

Constraints we are trying to satisfy:

- **Update cost proportional to what changed**, not to template size.
- **Lower memory churn** — avoid per-render allocation of a VNode tree.
- **Smaller runtime** when an application uses only Vapor components — the entire
  diffing engine can be tree-shaken away.
- **No change to the authoring experience** — developers write the same `.html`
  templates and the same `LightningElement` JavaScript classes.
- **Coexistence** — Vapor and standard components must interoperate in the same
  app during a long migration period.

Benchmarks of the prototype on the standard js-framework-benchmark operations
(see *Detailed design → Performance*) show Vapor **~12× faster at updating** a
1,000-row table (the dominant real-world case), at the cost of being ~1.3–1.5×
slower on initial mount and full teardown — the same trade-off profile as Vue
Vapor and Solid.js.

## Detailed design

Vapor Mode is delivered as two new packages that sit alongside the existing
compiler and engine. **No existing package behavior changes.**

- `@lwc/template-compiler-vapor` — compiles a `.html` template to a render
  module of direct DOM operations.
- `@lwc/engine-vapor` — the VDOM-less runtime providing `template()`,
  `renderEffect()`, `setText()`, `createIf()`, `createFor()`, etc.

### Terminology

- **Block** — a unit of rendered output: a DOM `Node`, a `VaporFragment`
  (a group of nodes with an anchor), a component instance, or an array of these.
  Blocks are the Vapor analog of a VNode subtree, but they *are* the real nodes.
- **Render effect** — a reactive effect (`renderEffect(fn)`) that tracks the
  reactive values read during `fn` and re-runs `fn` (writing to the DOM) when any
  of them change.
- **Dynamic fragment** — a `Block` placeholder anchored by a comment node, whose
  contents are swapped reactively. Used to implement `lwc:if` and `<slot>`.

### Compilation pipeline

The Vapor compiler is a three-stage pipeline mirroring the standard compiler's
structure (parse → transform → generate):

1. **Parse.** The LWC template HTML is parsed into a node tree. The prototype
   uses a focused parser; the production implementation will reuse
   `@lwc/template-compiler`'s existing parser and AST so that all directive
   semantics, validation, and error messages stay identical.

2. **Transform (AST → IR).** The tree is lowered to an intermediate
   representation that explicitly separates:
   - **static structure** — accumulated into a single HTML string per block,
     instantiated once at runtime via `template()` and cloned per use;
   - **node references** — traversal paths (`child`, `nthChild`, `next`) used to
     reach the dynamic nodes inside a cloned template;
   - **operations** — one-time side effects (event listeners, refs, control-flow
     construction);
   - **effects** — reactive bindings, each destined to be wrapped in its own
     `renderEffect`.

   The IR node types are: `SET_PROP`, `SET_ATTR`, `SET_CLASS`, `SET_STYLE`,
   `SET_TEXT`, `SET_EVENT`, `IF`, `FOR`, `SLOT`, `COMPONENT`, and `REF`.

3. **Generate (IR → JS).** The IR is emitted as an ES module that imports
   helpers from `@lwc/engine-vapor` and exports a `render($cmp, $slotset)`
   function.

### Static hoisting and node references

Static subtrees become a single template string, parsed into DOM once and cloned
on each instantiation. Dynamic descendants are reached by cheap traversal rather
than by `querySelector`:

```js
const t0 = template("<div class=\"card\"><h2> </h2><p> </p></div>");

export default function render($cmp) {
    const n0 = t0();            // clone the static card
    const n1 = child(n0);       // <h2>
    const n2 = child(n1);       // <h2>'s text node
    const n3 = nthChild(n0, 1); // <p>
    const n4 = child(n3);       // <p>'s text node
    renderEffect(() => setText(n2, $cmp.title));
    renderEffect(() => setText(n4, $cmp.body));
    return n0;
}
```

### Reactivity

Vapor uses a fine-grained reactive system:

- Reactive component fields are read through a proxy that calls `track(dep)`
  during effect execution, recording a dependency between the current effect and
  that field.
- Writing a field calls `trigger(dep)`, which notifies (and re-runs) exactly the
  effects that read it.
- Effects use **mark-and-sweep** dependency tracking: on each run, dependencies
  observed during the previous run that are not observed again are dropped, while
  stable dependencies are not churned. This keeps the steady-state update path
  allocation-free.
- Writes can be **batched** (`batch(fn)`) so that multiple field updates in one
  turn flush their effects once.

In the production integration, this reactivity layer is bridged to LWC's existing
reactivity membrane and `@track`/`@api`/signals machinery rather than introducing
a second, independent reactive system (see *Unresolved questions*).

### Control flow

**Conditionals** (`lwc:if` / `if:true` / `if:false`) compile to `createIf`, which
returns a dynamic fragment anchored by a comment node and swaps its contents when
the condition changes:

```js
const d0 = createIf(
    () => $cmp.visible,
    () => { const n0 = t0(); return n0; }   // positive branch
);
```

**Loops** (`for:each` / `for:of`) compile to `createFor`, which maintains keyed or
unkeyed blocks and reconciles them against the source array. When a loop appears
inside a static parent (e.g. `<ul><li for:each>`), the compiler emits a comment
anchor inside the parent's static template and inserts the loop's blocks at that
anchor:

```js
const t1 = template("<ul><!--lwc-vapor--></ul>");
const t0 = template("<li> </li>");

export default function render($cmp) {
    const n0 = t1();
    const n1 = nthChild(n0, 0);                  // the anchor comment
    const d0 = createFor(
        () => $cmp.items,
        (item) => {
            const n2 = t0();
            const n3 = child(n2);
            renderEffect(() => setText(n3, item.name));
            return n2;
        },
        (item) => item.id                        // key function
    );
    insert(d0, n0, n1);                          // mount the list at the anchor
    return n0;
}
```

### Events

Events that bubble and are safe to delegate (click, input, change, keydown, …)
are attached once at the document level via `delegateEvents()`, with per-element
handlers stored as `$evt<name>` properties and dispatched by walking the
composed path (respecting shadow boundaries). Non-delegatable events use a direct
`addEventListener` with automatic cleanup tied to the owning scope.

### Components, slots, and refs

- **Child components** compile to `createVaporComponent(tag, props)`, with props
  passed as live getters so the child's bindings stay reactive.
- **Slots** compile to `createSlot(name, $slotset)`, a dynamic fragment that
  renders the passed-in slot content or fallback.
- **`lwc:ref`** compiles to `applyRefs(node, name)`, populating `this.refs`.

### Component lifecycle

`@lwc/engine-vapor` defines a component instance that owns its root block, its
shadow root (native open/closed or light DOM, matching `renderMode`/
`shadowMode`), its reactive props, and its effect scope. Lifecycle hooks
(`connectedCallback`, `renderedCallback`, `disconnectedCallback`, etc.) map onto
the standard custom-element lifecycle, so the authored component class is
unchanged.

### Performance

The prototype is benchmarked with the **"krausest" js-framework-benchmark
operation set ported directly from Vue Vapor's own benchmark** (create 1k/10k
rows, update every 10th row, swap, remove, clear), using Vue's exact
adjective/colour/noun data generator. Vapor is compared against a representative
keyed create→diff→patch VDOM baseline (`vitest bench`, jsdom).

| Operation | vapor | vdom | Verdict |
| --- | --- | --- | --- |
| **Update every 10th of 1,000 rows** | ~3,300/s | ~275/s | **Vapor ~12× faster** |
| Swap two rows in 1,000 | fast | ~260/s | Vapor much faster |
| Remove rows one-by-one (100) | faster | slower | Vapor faster |
| Create 1,000 rows (mount) | ~76/s | ~113/s | VDOM ~1.5× faster |
| Create 10,000 rows (mount) | ~7.4/s | ~9.7/s | VDOM ~1.3× faster |
| Clear 1,000 rows (teardown) | ~63/s | ~96/s | VDOM ~1.5× faster |

This is the **same performance profile as Vue Vapor and Solid.js**, and it is the
honest, expected shape for VDOM-less rendering:

- **Updates win decisively** (here ~12×). Fine-grained reactivity touches only
  the DOM nodes whose data changed; there is no tree rebuild or diff. This is the
  case that dominates real interactive applications, and it far exceeds the ≥30%
  improvement target.
- **Initial mount and full teardown are modestly slower** (~1.3–1.5×). Each row
  sets up its own effect scope and reactive refs — real per-row cost that the
  VDOM baseline does not pay. List reconciliation uses a longest-increasing-
  subsequence algorithm (as in Vue/Inferno) so that updates and reorders move the
  minimum number of DOM nodes.

The mount/teardown tax is the accepted trade-off for eliminating the virtual DOM;
it is bounded (a small constant factor) and is heavily outweighed by the update
gains over a component's lifetime. Reducing it further (e.g. pooling effect
scopes, batching scope teardown) is future optimization work, tracked below.

## Drawbacks

- **Implementation and maintenance cost.** Two substantial new packages (a
  compiler and a runtime) must be built and kept in sync with template-syntax and
  reactivity changes. This is the largest cost.
- **Two rendering models.** Until/unless Vapor fully replaces the VDOM engine,
  LWC maintains two renderers. Features must be considered in both.
- **Interop complexity.** A standard parent rendering a Vapor child (and vice
  versa) requires a documented boundary protocol. This is the riskiest area.
- **SSR/hydration.** Server rendering and hydration must be designed for the
  Vapor output format; the prototype is client-only.
- **Debugging shift.** Stack traces and devtools reflect effects and direct DOM
  ops rather than a VNode tree; tooling and docs must adapt.
- **Cannot be implemented in user space.** It requires compiler and engine
  changes.

## Alternatives

- **Do nothing / keep optimizing the VDOM.** Continued incremental wins (static
  hoisting, `parseFragment`, compiler-informed patch flags) are possible, but
  they cannot make update cost proportional to change size; the diff is
  fundamental to the model.
- **Compile to imperative patches but keep a VNode tree** (the "block tree"
  approach). Less invasive but retains per-render allocation and a diff step;
  smaller ceiling on gains.
- **Adopt Vapor's exact output verbatim from Vue.** Rejected: LWC's template
  syntax (`for:each`, `lwc:if`, `lwc:ref`), shadow/light DOM model, scoped
  styles, and reactivity differ enough that a direct port would not fit.

Impact of not doing this: LWC's update performance remains bounded by VDOM
overhead, and bundle size cannot shed the diffing engine for Vapor-only apps.

## Adoption strategy

This is **opt-in and non-breaking**. Proposed phasing:

1. **Experimental.** Ship both packages behind a compiler flag
   (e.g. `vapor: true`) and/or an API-version gate. Templates compile to Vapor
   only when opted in. No existing component is affected.
2. **Per-component opt-in.** Allow a component to declare Vapor rendering (e.g. a
   static class field or template marker), enabling gradual migration.
3. **Interop guarantees.** Standard ↔ Vapor parent/child rendering is supported
   throughout, so teams migrate leaf components first and work upward.

Because the authored `.html` and `.js` are unchanged, **no codemod is required**
for the common case. A lint/validation pass will flag the rare template construct
not yet supported by the Vapor compiler so authors know before opting in.

# How we teach this

Vapor Mode should be taught as **an implementation detail, not a new programming
model**: "the same component, compiled to skip the virtual DOM." The headline for
developers is "faster updates and smaller bundles, same code."

Documentation additions:

- A conceptual page contrasting VDOM diffing with fine-grained reactive updates,
  using the basic example above.
- A short "compiled output" explainer for advanced users debugging Vapor
  components (what `renderEffect`, `template`, and dynamic fragments are).
- Migration guidance: how to opt in, how to read the supported-feature matrix,
  and how interop works.

Existing patterns (`@api`, `@track`, `lwc:if`, `for:each`, `lwc:ref`, slots,
shadow/light DOM) carry over unchanged conceptually, which keeps the teaching
burden low.

# Unresolved questions

- **Reactivity unification.** The prototype ships its own fine-grained reactive
  core. Production must bridge to LWC's existing reactivity membrane,
  `@track`/`@api`, and signals so there is one source of truth. What is the exact
  bridge, and what are its performance implications?
- **SSR and hydration.** What is the Vapor output's serialized form, and how do
  effects "adopt" server-rendered DOM on the client?
- **Synthetic shadow.** How does Vapor interact with synthetic-shadow styling and
  scoping, and with scoped-CSS tokens?
- **`lwc:dom="manual"`, dynamic components (`lwc:is`), `lwc:spread`,
  `lwc:on`** — confirm full directive coverage and compiled forms.
- **Keyed reconciliation algorithm.** The prototype uses a straightforward keyed
  diff; production should evaluate a longest-increasing-subsequence move strategy
  for large reorders.
- **Opt-in surface.** Compiler flag vs. per-component declaration vs.
  API-version — which (or which combination) is the right developer-facing knob?
