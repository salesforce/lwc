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

When declaring a tag in the template, an attribute in the tag can be set to a property from the component instance. To do so, the `set:` directive can be used:

```html
<template>
    <a set:href="url">{name}</a>
    <p>{tagline}</p>
</template>
```

As a result, the attribute `href` will be set to `this.url` for the `<a>` element. This is equivalent to `{propertyName}` in the sense that mutations on `this.url` will cause a rehydration to happen on the DOM fragment without user intervention. Any attribute can use the `set:` directive.

Additionally, a more complex lookup like `set:href="x.y.z"` will set the `href` attribute to the value of `this.x.y.x`.

_Note: In the example above, `this.url` could be a computed value via a getter definition in the Component Definition._

## Conditions

If you need to remove or add pieces of the fragment conditionally, you can use the `set:` directive with the special attribute name `if` to conditionally render a pieces of the template, e.g.:

```html
<template>
    <a href="#">{name}</a>
    <p set:if="tagline">{tagline}</p>
</template>
```

In the example above, the `<p>` element will be rendered only if the value of `this.tagline` is not falsy.

_Note: Think of this as a simple `if (!this.tagline) { ... }` statement in your logic._

At the moment, there is no `else` equivalent declarative form, or a way to indicate `negation` of that condition. Instead, you can rely on a getter in your component declaration to produce the right boolean value, e.g.:

```html
<template>
    <a href="#">{name}</a>
    <p set:if="tagline">{tagline}</p>
    <p set:if="invalidTagline">fallback tagline</p>
</template>
```

In this example, you have to add a new getter in your component declaration to return `true` or `false` when accessing `this.invalidTagline`.

## Iterations

```html
<template>
    <ul>
        <li repeat:for="item of items">
            {item.firstname} {item.lastname}
        </li>
    </ul>
</template>
```

The example above will iterate over `this.items`, and create one `<li>` element for each element in that collection by providing a new bound element accessible via `item` that is only scoped for the new fragment. In other words, this will be transpiled into something similar to the following imperative functional code:

```js
return this.items.map((item) => {
    const el = document.createElement('li');
    el.innerHTML = item.firstname + ' ' + item.lastname;
    return el;
}, this)
```

__Important Notes:__

* The tag with the `repeat:for` directive can use the iterator value. In the example above, `item` can be used there just like it is used inside the children, e.g.: `<li repeat:for="item of items" set:title="item.firstname">`.

* The index of the iterator is available via `index`, e.g.: `<li repeat:for="item of items">{index} {item.firstname}</li>`

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

### Other Possible Options

To avoid the confusion about the scope of the iterable, a `<template>` tag can help to define that boundary, adding the restriction that `repeat:for` can only be used in a `<template>` tag.

```html
<template>
    <ul>
        <template repeat:for="item of items" repeat:key="item.id">
            <li>
                {item.firstname} {item.lastname}
            </li>
        </template>
    </ul>
</template>
```

## Event Bindings

Binding an event to a Raptor Element is very similar to set an attribute. The `bind:` directive can be used to add an event listener bound to an event handler function. e.g:

```html
<template>
    <a href="#foo" bind:onclick="handleClick">click here</a>>
</template>
```

In the example above, the `onclick` event of the `<a>` tag will invoke a function called `this.handleClick` on the corresponding component.

__Important Notes:__

Important things to keep in mind when using the `bind:` directive:

 * when the `this.handleClick` is invoked, the `this` value inside the `handleClick` function will be preserved since Raptor does the correct binding to guarantee that.
 * `bind:` directive can be used with any attribute, even if it is not an event handler, e.g.: `<foo-bar bind:xyz-callback="doSomething">`.

## Aliasing using `is` attribute

There are cases in HTML where a custom element cannot be used. An example of this is a `<tr>` inside a table's `<tbody>`. If the HTML parser encouters something different from `<tr>` it will move the element out of the `<table>` tag as part of the HTML normalization process, e.g.:

```html
<template>
    <table>
        <tbody>
            <foo-bar set:x="computedValue" y="some text">
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
            <tr is="foo-bar" set:x="computedValue" y="some text">
            </tr>
        </tbody>
    </table>
</template>
```

The value of the `is` attribute signaling that the `<tr>` element should be used, and should be upgraded and controlled by the component resolved from the module identifier "foo:bar". These two examples above are equivalent, the only difference is that instead of using the custom element `<foo-bar>` it uses `<tr>` as the base element for the new instance of the corresponding component.
