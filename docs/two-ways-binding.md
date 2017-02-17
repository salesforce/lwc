# Two-ways bindings

## Two-ways Attributes

In some edge cases, an attribute must be set to a value, but also allow the receiver of the attribute to mutate the source property from the provider, to conform with a two-ways binding mechanism. For that, the template offers the `model:` annotation:

```html
<template>
    <foo-bar model:price={value} />
</template>
```

The `model:` annotation behaves very similarly to `set:` with the difference that the receiver *must* explicitely add the property corresponding to the attribute (in this case `price`) as a two-ways bound property, e.g.:

```js
export default class FooBar {
    price = 0;

    handleChange(event) {
        this.price = event.currentTarget.value;
    }
}
FooBar.twoWaysProps = ['price'];
```

If `'price'` is not in the collection of `twoWaysProps`, it will result on a static error.

Additionally, if the `set:` annotation is used in a declated two-ways bound property, the value will never change as a result of a mutation in the receiver, although the receive might get rehydratated on its own.

```html
<template>
    <foo-bar set:price="value" />
</template>
```

## Important Notice

The caveat here is that mutations on the parent component will always rehydrate the receiver (as corresponding), setting `price` attribute to a new value, independently of the state of the `this.price` property on the receiver, while local mutations of `this.price` in the receiver will not update the `this.value` on the parent component.
