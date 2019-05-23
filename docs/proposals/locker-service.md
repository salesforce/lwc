# Locker Service

## Status

_drafted_

## Invariants

* the HOST element is the public api of the component.
* creation and render are the critial paths, no membrane implementation is allowed during crital path execution.
* LWC elements and HTML elements cannot be propagated as properties.

## Matching the semantics of the shadow DOM with closed mode

### Proposal 1

Reuse CSS marks to apply runtime access checks:

x-foo.html
```html
<template>
    <div>
        <p>
            <x-bar>
                <div onclick={handleClick}>
</template>
```

x-bar.html
```html
<template>
    <div>
        <slot></slot>
    </div>
</template>
```

Assuming that there is a `main.js` that creates the instance of `x-foo`, the output markup will be:

```html
<x-foo x="maintpl">
    <div x="footpl">
        <p x="footpl">
            <x-bar x="footpl">
                <div x="bartpl">
                    <slot x="bartpl">
                        <div onclick={handleClick} x="footpl">
```

In the output dom structure, there are marks everywhere in the dom via the `x` attribute (we can bikeshed on the name of this special reserved attribute). This mark represents the html template that was used to render the body of the custom element, which also represents the elements that you can reach to via DOM queries. E.g.:

```js
// in foo.js
this.querySelectorAll('div') // returns [<div x="footpl">, <div onclick={handleClick} x="footpl">]
```

We can use the mark to filter out elements that are not reachable by the WC's shadowdom specification.

### Open questions about Proposal 1

* How to prevent access to nested `<x-foo>` instances since they will also have the mark `x="footpl"`?

### Proposal 2

Use symbol as property on every element created by a template.

These approach is very promising. The idea is that a compiled template will expose a symbol as a member of the imported HTML reference, and it will pass that symbol to any element created by that template, and whose value will be the unique id of the component. e.g.:

```js
const token = new Symbol();
export default function html(api, cmp, slotset, memoizer, uid) {
    return api.h('p', { props: { [token]: uid } });
}
html.token = token;
```

Which means that at the runtime level we can apply checks like the following:

```js
elm[html.token] === vnode.vm.uid;
```

This seems to be better than Proposal 1 because it is per instance, which means deep search is not needed.

## Membranes

Locker will require membranes to apply the access checks. It is not really about access checks, but mostly about returning secure versions of objects. One thing that we are trying to improve here with respect to current implementation is that those membranes are sometimes costly to create. In Lightning Web Components, we want to focus on the critical paths, and avoid any extra work that is not needed. The proposal is to have a set of hooks that the locker service can define, and the engine will call those hooks when something important happens.

One of those hooks is the membrane hook. The engine can determine when a component is accessing an object that is an external resource, and apply the membrane mechanism there by calling the membrane hook in the locker service, and let the locker to return the corresponding secure object or the original object when needed. This is different from having to create secure version of all arguments and returned value when calling a method on a component, and must be focused on the consumer of the object instead of the provider having to take those measurements.
