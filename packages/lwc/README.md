Lightning Web Components (LWC) is an enterprise-grade web components foundation for building user interfaces. LWC provides a simple authoring format for UI components, which is compiled into low-level Web Component APIs. The `lwc` package is the main entry point for dependencies.

- Develop components quickly and declaratively using HTML, JavaScript, and CSS.
- Develop accessible components so that everyone can understand and navigate your app.
- Components are encapsulated in Shadow DOM, with the `@lwc/synthetic-shadow` package as an optional polyfill for older browsers.

Developing a Lightning web component is this easy:

```ascii
counter
  ├──counter.css
  ├──counter.html
  └──counter.js
```

```html
<!-- counter.html -->
<template>
    <p>Counter: {count}</p>
    <button onclick="{increaseCounter}">Add</button>
</template>
```

```css
/* counter.css */
p {
    font-family: serif;
    font-size: large;
}
```

```javascript
// counter.js
import { LightningElement } from 'lwc';

export default class Counter extends LightningElement {
    count = 0;

    increaseCounter() {
        this.count += 1;
    }
}
```

## Supported Browsers

LWC supports [all browsers supported in Salesforce Lightning Experience](https://help.salesforce.com/s/articleView?id=sf.getstart_browsers_sfx.htm&type=5).

As of LWC v3.0.0, Microsoft® Internet Explorer® 11 is no longer supported.

## Docs, Recipes, & Support

[lwc.dev](https://lwc.dev) has all the information you need to develop components using LWC, including [code recipes](https://recipes.lwc.dev/) and code playgrounds.

For support, use the `lwc` tag on [Stack Overflow](https://stackoverflow.com/questions/tagged/lwc) or the `lightning-web-components` tag on [Salesforce Stack Exchange](https://salesforce.stackexchange.com/questions/tagged/lightning-web-components).

When filing a bug, it's useful to use [playground.lwc.dev](https://playground.lwc.dev/) to create a live reproduction of the issue.

## Release Notes

Changes are documented at [github.com/salesforce/lwc/releases](https://github.com/salesforce/lwc/releases).

## The `lwc` package

This package (`lwc`) is a convenience package that re-exports all packages that might be used for LWC component development. Installing it also installs the core `@lwc/*` packages.

For example, to use `@lwc/engine-server` from this package, you can do:

```js
import { renderComponent } from 'lwc/engine-server';
```

This is equivalent to:

```js
import { renderComponent } from '@lwc/engine-server';
```

## Experimental Packages

The `@lwc/ssr-compiler` and `@lwc/ssr-runtime` packages are still considered experimental, and may break without notice.

## Experimental APIs

### setTrustedSignalSet()

This experimental API enables the addition of a signal as a trusted signal. If the [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature is enabled, any signal value change will trigger a re-render.

If `setTrustedSignalSet` is called more than once, it will throw an error. If it is never called, then no trusted signal validation will be performed. The same `setTrustedSignalSet` API must be called on both `@lwc/engine-dom` and `@lwc/signals`.

### setContextKeys

Not intended for external use. Enables another library to establish contextful relationships via the LWC component tree. The `connectContext` and `disconnectContext` symbols that are provided are later used to identify methods that facilitate the establishment and dissolution of these contextful relationships. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.

### setTrustedContextSet()

Not intended for external use. This experimental API enables the addition of context as trusted context. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.

If `setTrustedContextSet` is called more than once, it will throw an error. If it is never called, then context will not be connected.

### addTrustedContext()

Not intended for external use. This experimental API adds trusted context that will be bound to an associated component lifecycle via `ContextBinding` for provision/consumption. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.

### ContextBinding

The context object's `connectContext` and `disconnectContext` methods are called with this object when contextful components are connected and disconnected. The ContextBinding exposes `provideContext` and `consumeContext`,
enabling the provision/consumption of a contextful Signal of a specified variety for the associated component. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.
