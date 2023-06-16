# @lwc/babel-plugin-component

## Summary

This babel plugin does the following transform:

-   Global decorator transform:
    -   Transform `@api` decorator to `publicProperties` and `publicMethods` static properties.
    -   Transform `@wire` decorator to `wire` static property.
    -   Transform `@track` decorator to `track` static property.
-   LWC component class sugar syntax:
    -   Check for misspelled lifecycle hooks.
    -   Import and inject `render` from a collocated template if a component class doesn't already implement a `render` method.
-   Optimization:
    -   If the compiler inject the default template a component, it will also wire the template style to the component.

## Installation

    npm install babel @lwc/babel-plugin-component

## Usage

```js
const babel = require('@babel/core');
const lwcPlugin = require('@lwc/babel-plugin-component');

const source = `
import { LightningElement } from 'lwc';
export default class extends LightningElement {}`;

const { code } = babel.transformSync(source, {
    plugins: [
        [
            lwcPlugin,
            {
                /* options */
            },
        ],
    ],
});
```

## Options

-   `name` (type: `string`, optional) - name of the component, e.g. `foo` in `x/foo`.
-   `namespace` (type: `string`, optional) - namepace of the component, e.g. `x` in `x/foo`.
-   `isExplicitImport` (type: `boolean`, optional) - true if this is an explicit import.
-   `dynamicImports` (type: `object`, optional) - see below:
    -   `loader` (type: `string`, optional) - loader to use at runtime.
    -   `strictSpecifier` (type: `boolean`, optional) - true if a strict specifier should be used.
-   `instrumentation` (type: `InstrumentationObject`, optional) - instrumentation object to gather metrics and non-error logs for internal use. See the `@lwc/errors` package for details on the interface.
-   `apiVersion` (type: `number`, optional) - API version to associate with the compiled component.
