Lightning Web Components (LWC) is an enterprise-grade web components foundation for building user interfaces. LWC provides a simple authoring format for UI Components. LWC compiles this authoring format into low-level Web Component APIs. The `lwc` package is the main entry point for dependencies.

-   Develop components quickly and declaratively using HTML, JavaScript, and CSS.
-   Develop accessible components so that everyone can understand and navigate your app.
-   Components are encapsulated in all browsers via the `@lwc/synthetic-shadow` package, which polyfills the Shadow DOM.

Developing a Lightning web component is this easy.

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

Get started fast using the [`create-lwc-app`](https://www.npmjs.com/package/create-lwc-app) tool.

```bash
npx create-lwc-app my-app
cd my-app
npm run watch
```

For support, use the `lwc` tag on [Stack Overflow](https://stackoverflow.com/questions/tagged/lwc) or the `lightning-web-components` tag on [Salesforce Stack Exchange](https://salesforce.stackexchange.com/questions/tagged/lightning-web-components).

## Release Notes

Changes are documented at [github.com/salesforce/lwc/releases](https://github.com/salesforce/lwc/releases).
