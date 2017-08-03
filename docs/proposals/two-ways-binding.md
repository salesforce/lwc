# Two-ways bindings

## Status

_Drafted_

## Goals

* Provide a simple, yet robust way to declarate two ways data bound attributes via template.

## Two-ways Attributes

In some edge cases, an attribute must be set to a value, but also allow the receiver of the attribute to mutate the source property from the provider, to conform with a two-ways binding mechanism. For that, the template offers the `model:` annotation:

```html
<template>
    <foo-bar model:price={state.x} />
</template>
```

The `model:` annotation only work with `state` values. You can't not use `model:` annotation for static values, or public property values. If the component that is receiving the property annotated with `model:` ever dispatch the `change` event, with the event's `detail` object containing a property `price` (for the example above), then the `state.x` will be updated to the new value provided via `event.detail.price`, e.g.:

```js
export default class FooBar extends Element {
    price = 0;

    handleEventToDoublePrice(event) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                price: this.price * 2,
            }
        }));
    }
}
FooBar.twoWaysProps = ['price'];
```

Additionally, the developer of the component that supports the two-ways bound property should annotate the class definition. If `'price'` is not in the collection of `twoWaysProps`, any component that attempt to use the `model:` annotation for this component, will result on a static error.

Additionally, if a two-ways bound property is defined, but the consumer of the component is not passing the `model:` annotation, everything works just the same as a regular public property that can only be changed by the owner component at will, and the value will never change as a result of a mutation in `foo-bar` from the example above, e.g.:

```html
<template>
    <foo-bar price={state.x} />
</template>
```

## Important Notice

The caveat here is that mutations on the parent component will always rehydrate the instance of `foo-bar` (as corresponding), setting `price` attribute to a new value, independently of the value of the `this.price` property on the `foo-bar`, while `change` events with `event.detail.price` will not update the `this.state.x` on the parent component.
