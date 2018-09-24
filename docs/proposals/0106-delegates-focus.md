# RFC: Accessibility - Delegate Focus

## Status

- Start Date: 2018-07-26
- RFC PR: TBD

## Summary

This RFC defines how to enable `delegatesFocus` flag when attaching a `ShadowRoot`. This defines the navigation sequence of elements contained by the `ShadowRoot`. Few rules:

* If the delegate focus flag is on, an element inside the shadow root is focused at the same time the host is focused. This literally means that there can be more than one active element at the same time, they just need to be in different shadow roots.
* If the delegate focus flag is on, and no element in the shadow root can receive focus, the host itself should be removed from the navigation since it cannot delegate its focus properly.
* If the delegate focus flag is off, an element inside the shadow root can still be focused, but the sequence is still dictated by the host to maintain the encapsulation. In other words, an element inside a shadow cannot disrupt the sequence of navigation of the page, it is always subject to its host place in the queue, independently of the delegate focus flag.
* Active descendant should work the same, independently of the delegate focus flag.
* If the delegate focus flag is on, and an element inside the shadow root receives the focus by mouse interaction, the focus should be also be placed on the host.

## Goals

* Polyfill `delegatesFocus` flag for _faux shadow_. For native, there is nothing to be done since browsers will take care of everything. This RFC describes how can we simulate the standard behavior in our synthetic shadow root implementation.

## Proposal

### Delegate Focus Flag

In LWC, users do not have control over when the shadowRoot is going to be attached, and what options to use when attaching it. This invariant must be preserved.

#### `delegatesFocus` flag

We will like `delegatesFocus` to be a class value, it can't be defined per instance since it might be used by the compiler to do extra optimizations. If you need a component that delegates or not a focus on demand, it is very likely that you can just create two components, once extending the other, and adding the delegate focus static flag.

For now, we can stick to a public static field, e.g.:

```js
export default class Foo extends LightningElement {
    static delegatesFocus = true;
}
```

We could extract that value when analyzing the class for the first time.


Open question:

* What is the semantic of this when extending a class that contains the delegatesFocus flag? Should the new class also delegate the focus? or should the newly created class redefine its own `static delegatesFocus` value?

#### Focus and Blur

* When the `delegatesFocus` flag is on, any focus on the element itself should be automatically delegated to its children.
* `elm.focus()` and `elm.blur()` should be well defined.
* When receiving focus programmatically, if there is no element in the shadow that can receive the delegation, the host itself is focused alone.
* When receiving focus by keyboard interaction, if there is no element in the shadow that can receive the delegation, the host itself should not be focused, and the next element in the queue should receive it instead.

### Implementation Details

We need a way to know, if in a particular shadow, there is at least one element that is focusable, because this is what triggers the cascading effect of the navigation order.

This is very difficult problem to solve, but if we rephrase the question, in the context of the fallback mode, we only really need to figure the actual focusable elements in the subtree, which could be achieve by a simple query that can return false positives, and zip through it to discard them.

This means that in fallback, no custom element itself, whether they have delegate focus or not, should retain the focus, in fact they should not be focusable at all, which means that the next focuseable element might or might not be inside its subtree. The only rule to achieve this is that no one, no exceptions, can have a tabindex bigger than 0.

Basically, the rules are:

* When the delegatesFocus flag is on, and no tabindex has been applied to the host, there is nothing to do, let the browser do its thing.
* When the delegatesFocus flag is on, and the consumer adds a tabindex of `-1` to the host, the host should get `tabindex=0`, and skip any navigation when it receive the focus, moving to the next or the previous one. Programmatic focus should still behaves as expected, placing the focus on the first focusabled element from its subtree (using the query described above).
* When the delegatesFocus flag is on, and the consumer adds a tabindex of `0` to the host, the host should get `tabindex=-1`, that way it is skipped from the flow, while allowing the tab to jump inside its subtree.
* When the delegatesFocus flag is off, and no tabindex has been applied to the host, there is nothing to do, let the browser do its thing.
* When the delegatesFocus flag is off, and the consumer adds a tabindex of `-1` to the host, the host should get `tabindex=0`, and skip any navigation when it receive the focus, moving to the next or the previous one. Programmatic focus should do nothing.
* When the delegatesFocus flag is off, and the consumer adds a tabindex of `0` to the host, the host should get `tabindex=0`, so it can actually get the focus.
