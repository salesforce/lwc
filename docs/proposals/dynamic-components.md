# Dynamic Components or Pivots

## Status

_wip_

## Goal

Support dynamic (lazy or promise based) component creation that runs in the same fiber.

## The Problem

Today, there are only 2 ways to create a LWC component instance:

 * Invoking `engine.createElement()`, which returns a new DOM Element with the public API of the underlaying component instance, creating a brand new fiber.
 * Use a `<template>` tag in a component, which creates a new component under the hood that runs on the same fiber as the owner component, and therefore it is subject to the invariants of the diffing algo.

The problem is that to create a component programatically, you have to use `engine.createElement()`, which implies creating a new fiber, which is sometimes undesirable because the developer will have to observe the owner state, and pipe all values into the children element manually, which also implies that there will be at multiple invocations to the patch mechanism (one per fiber).

## Open questions

 * Can the dynamic component method be a parameter on render?
 * Lifecycle hooks: Where is the right place for all this?
 * Promise based? An opaque construct?
 * Slots placeholder support: What if owner has a slot that should be propagated to the children?
 * Can children component be folded into the owner?

## Proposals

### Proposal 1: Imperative API to create templates

A very low level API that let you create a dynamic template that can be returned in your render method.

```js
export default class Foo extends Element {
    render() {
         // could be a promise of template.create()
        return template.create([
            template.element('lightning-icon')
                .attributes({
                    "label": template.static('static value'), // must be a label though
                    "icon-name": template.dynamic('state.name'),
                    "variant": template.dynamic('computedVariant'),
                })
                .events({
                    "onclick": template.invoke('handleClick'),
                })
                .children([]), // default behavior
        ]);
    }
}
```

Pros:
 * Very flexible, you could generate anything.
 * No changes needed in the engine, nor on the diffing algo.
 * Seemless integration with compiled templates, without observable differences.
 * Could be make more restrictive if needed.
 * The result of `template.create()` is memoizable, and we can warn when they create it everytime in render().

Cons:
 * How to guarantee that all custom elements used by the newly create elements are available?
 * Expands the API footprint of LWC, now we need to offer a bunch of new APIs to support this.
 * It is going to be a very low level API. Probably no suitable for external customers.
 * Almost equivalent to expose api.* to user-land.
 * Might require some logic from compiler to be available in engine (e.g.: attrs vs props).

_Note: the render() method might also expect a promise of the dynamic template._

### Proposal 2: Imperative API to create a new opaque object representing a custom element

```js
export default class Foo extends Element {
    render() {
        return createDynamicElement('x-bar', Bar, props); // could be a promise of this invocation as well
    }
}
```

Pros:
 * Small change in the engine to support these new constructor.
 * Simple enough to prevent them from shooting themself in the foot.

Cons:
 * Very restrictive, (no explicit HTML attrs, no explicit events, etc.)
 * Not very ergonomic, and maybe hard to explain how it works.
 * Confusing because they will not know that it must be created everytime the render mechod is called.

_Note: the render() method might also expect a promise of the dynamic element._

### Proposal 3: Promise Based Template

```js
import { LighntningElement } from "lwc";
import { Bar } from "x-bar";

export default class Foo extends Element {
    render() {
        return Bar.prototype.render.call(this); // could be a promise of this invocation as well
    }
}
```

Pros:
 * It is just Javascript.
 * No new API needed.
 * Ideally for generated components without logic, just template.
 * Simple enough to prevent them from shooting themself in the foot.

Cons:
 * Very restrictive since `Foo` MUST implement all functionalities of `Bar`, since it is a pivot.
 * They might think they can do all kind of JS sorcery in render method.
 * No functionality exposed by pivot that can be piped into the dynamic template, only events propagated from inner components.

_Note: the render() method might also expect a promise of the template function._
