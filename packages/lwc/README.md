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

| Browser                       | Version |
| ----------------------------- | ------- |
| Microsoft® Internet Explorer® | IE 11\* |
| Microsoft® Edge               | Latest  |
| Google Chrome™                | Latest  |
| Mozilla® Firefox®             | Latest  |
| Apple® Safari®                | 12.x+   |

For IE 11, LWC uses compatibility mode. Code is transpiled down to ES5 and the required polyfills are added. To develop components that run in IE 11, follow the [compatibility mode](https://github.com/salesforce/eslint-plugin-lwc#compat-performance) linting rules.

## Docs, Recipes, & Support

[lwc.dev](https://lwc.dev) has all the information you need to develop components using LWC, including [code recipes](https://recipes.lwc.dev/) and code playgrounds.

For support, use the `lwc` tag on [Stack Overflow](https://stackoverflow.com/questions/tagged/lwc) or the `lightning-web-components` tag on [Salesforce Stack Exchange](https://salesforce.stackexchange.com/questions/tagged/lightning-web-components).

When filing a bug, it's useful to use [playground.lwc.dev](https://playground.lwc.dev/) to create a live reproduction of the issue.

## Release Notes

Changes are documented at [github.com/salesforce/lwc/releases](https://github.com/salesforce/lwc/releases).
