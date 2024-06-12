Lightning Web Components (LWC) is an enterprise-grade web components foundation for building user interfaces. LWC provides a simple authoring format for UI components, which is compiled into low-level Web Component APIs. The `lwc` package is the main entry point for dependencies.

-   Develop components quickly and declaratively using HTML, JavaScript, and CSS.
-   Develop accessible components so that everyone can understand and navigate your app.
-   Components are encapsulated in Shadow DOM, with the `@lwc/synthetic-shadow` package as an optional polyfill for older browsers.

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
