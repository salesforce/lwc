# Template definition for a Component

Templates for Raptor Components are regular `<template>` tags with

https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template

## Template Declaration

### Basic HTML Template

```html
<template>
    <a href="#something">click here</a>
    <p>some description</p>
</template>
```

## Literals

Additionally, you can use any property that conforms the state of the component instance by using `{propertyName}`, e.g.:

```html
<template>
    <a href="#something">{name}</a>
    <p>{tagline}</p>
</template>
```

Where the text `{name}` and `{tagline}` will be replaced with the value of `this.name` and `this.tagline` properties from the component respectively, and any mutation on any of those two properties will be rehydrated on the DOM fragment without user intervention.

If the attribute is not defined, is `undefined` or `null`, and empty string value will be used, otherwise, a `ToString()` operation will be applied before replacing each token.

Additionally, a more complex lookup like `{x.y.z}` will resolve to `this.x.y.x`.

## Attributes

When declaring a tag in the template, an attribute in the tag can be set to a property from the component instance. To do so, you can use the curled brackets notation without quotes:

```html
<template>
    <a href={url}>{name}</a>
    <p>{tagline}</p>
</template>
```

As a result, the attribute `href` will be set to `this.url` for the `<a>` element. This is equivalent to `{propertyName}` in the sense that mutations on `this.url` will cause a rehydration to happen on the DOM fragment without user intervention. Any attribute can use the curled-brackets notation.

Additionally, a more complex lookup like `href={x.y.z}` will set the `href` attribute to the value of `this.x.y.x`.

_Note: In the example above, `this.url` could be a computed value via a getter definition in the Component Definition._

## Conditions

If you need to remove or add pieces of the fragment conditionally, you can use the `if:` directive to conditionally render a pieces of the template, e.g.:

```html
<template>
    <a href="#">{name}</a>
    <p branch:if={tagline}>{tagline}</p>
</template>
```

In the example above, the `<p>` element will be rendered only if the value of `this.tagline` is not falsy.

_Note: Think of this as a simple `if (!this.tagline) { ... }` statement in your logic._

At the moment, there is no `else` equivalent declarative form, or a way to indicate `negation` of that condition. Instead, you can rely on a getter in your component declaration to produce the right boolean value, e.g.:

```html
<template>
    <a href="#">{name}</a>
    <p branch:if={tagline}>{tagline}</p>
    <p branch:if={invalidTagline}>fallback tagline</p>
</template>
```

In this example, you have to add a new getter in your component declaration to return `true` or `false` when accessing `this.invalidTagline`.

### Conditions in fragments

If you have a group of elements that should be displayed conditionally, you can use the `<template>` tag to group them under a single condition, e.g.:

```html
<template>
    <a href="#">{name}</a>
    <template branch:if={name}>
        <p>Age: {age}</p>
        <p>Genre: {genre}</p>
    </template>
</template>
```

As a result, the `<template>` will be removed from the DOM in favor of its content when `{this.tagline}` is not falsy.

## Iterations

```html
<template>
    <ul>
        <template for:each="item of items">
            <li>
                {item.firstname} {item.lastname}
            </li>
        </template>
    </ul>
</template>
```

The example above will iterate over `this.items`, and create one `<li>` element for each element in that collection by providing a new bound element accessible via `item` that is only scoped for the new fragment. In other words, think of this as something similar to the following imperative functional code:

```js
return this.items.map((item) => {
    const el = document.createElement('li');
    el.innerHTML = item.firstname + ' ' + item.lastname;
    return el;
}, this)
```

__Important Notes:__

* The `for:each` directive should only be used in `<template>` tags.

* The tag with the `for:each` directive cannot use the iterator value, that's only available in the scoped content of the `<template>`.

* The index of the iterator is available via `index`, e.g.: `<li>{index} {item.firstname}</li>`

* Every value item in the iterable should contain a `key` member value with a unique identifier for the item in the collection. If this `key` is not provided, the diffing algoritsm will be more expensive. A possible value for the `this.items` collection value for the example above could be:

```js
[
    {
        key: 1,
        firstname: 'john',
        lastname: 'smith'
    },
    {
        key: 2,
        firstname: 'juan',
        lastname: 'perez'
    }
];
```

### Advanced Options

#### Custom Indexes

As mentioned above, the index of the iteration will be availabe by default via `{index}` inde the `<template>` tag, but if that conflicts with an outer reference, you can specify the name of the variable where the value of the index will be set by using the `repeat:index` directive, e.g.:

```html
<template>
    <ul>
        <template for:each="item of items" repeat:index="i">
            <li>
                {i} - {item.firstname} {item.lastname}
            </li>
        </template>
    </ul>
</template>
```

In the example above, `{i}` indicates the position of the element `item` of `items`.

#### Keys

A `key` attribute is required in any custom element used inside an iterator. The reason for this requirement is that custom elements might or might not have internal state, and in order for the diffing algo to preserve the state, it must know whether or not two similar custom elements can share the same state (same underlaying component instance).

Unfortunately, this is something that the developer will have to define, e.g.:

```html
<template>
    <ul>
        <template for:each="item of items" repeat:key="id">
            <foo-bar key={item.id}>
                {item.firstname} {item.lastname}
            </foo-bar>
        </template>
    </ul>
</template>
```

In the example above, the value of `item.id` will be used as the key for each `<foo-bar>` element. A missing `key` will result in a static error during compilation. Keep in mind that those keys are only needed on custom elements, regular HTML Elements will not require the key, but using it is always a recommendation, since it improve the overall performance of the diffing algo. In runtime, if the key is set to undefined or null, or we encounter multiple elements with the same key in the same iteration, a warning message will be issued.

## Event Bindings

Binding an event to a Raptor Element is very similar to set an attribute. When a curled brackets notation appear on an attribute prefixed with `on`, an event listener will be added to the element to trigger the corresponding handler method. e.g:

```html
<template>
    <a href="#foo" onclick={handleClick}>click here</a>>
</template>
```

In the example above, the `onclick` event of the `<a>` tag will invoke a function called `this.handleClick` on the corresponding component.

__Important Notes:__

Important things to keep in mind when using this heuristic:

 * when the `this.handleClick` is invoked, the `this` value inside the `handleClick` function will be preserved since Raptor does the correct binding to guarantee that.

## Aliasing using `is` attribute

There are cases in HTML where a custom element cannot be used. An example of this is a `<tr>` inside a table's `<tbody>`. If the HTML parser encouters something different from `<tr>` it will move the element out of the `<table>` tag as part of the HTML normalization process, e.g.:

```html
<template>
    <table>
        <tbody>
            <foo-bar x={computedValue} y="some text">
            </foo-bar>
        </tbody>
    </table>
</template>
```

If you want to provide an abstraction of the `tr`, delegating it to a Raptor Component, you will have to use the HTML standard `is` attribute introduced for Web Components. E.g.:

```html
<template>
    <table>
        <tbody>
            <tr is="foo-bar" x={computedValue} y="some text">
            </tr>
        </tbody>
    </table>
</template>
```

The value of the `is` attribute signaling that the `<tr>` element should be used, and should be upgraded and controlled by the component resolved from the module identifier "foo:bar". These two examples above are equivalent, the only difference is that instead of using the custom element `<foo-bar>` it uses `<tr>` as the base element for the new instance of the corresponding component.
