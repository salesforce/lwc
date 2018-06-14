# RFC: CSS Custom Properties

## Status

- Start Date: 2018-06-13
- RFC PR: https://github.com/salesforce/lwc/pull/412

## Summary

> This RFC defines the changes that need to be made to the LWC compiler to accommodate the usage of custom properties.

## Motivation

Because of the Shadow DOM, it's impossible to style components from the outside. The shadow DOM tree inherits it's CSS properties from its host element. Custom properties provide a way to add a styling API to a component since custom properties traverse the Shadow DOM boundaries.

Even if customProperties is a [standard CSS feature](https://drafts.csswg.org/css-variables) all the browsers that LWC target doesn't support it.

## Custom Property usage

This section outlines how custom properties work.

```css
/* Global stylesheet applied at the document level (app.css) */
:root {
    --text-color: red;
    --bg-color: blue;
}

/* x-foo component style (x-foo.css) */
h1 {
    color: var(--text-color);
}

.content {
    background-color: var(--bg-color, green);
}
```

A custom property is a name starting with `--` (double hyphen), like `--text-color`. Like any ordinary property, custom properties can be defined on any element and follow the same cascading rules.

The consumption of the custom properties is done via the `var()` function. This CSS function accepts 2 arguments: a required custom property name and an optional fallback value.

## Requirements

* IE11 doesn't support custom properties syntax.
* A large number of custom properties can be harmful in terms of rendering performance. In Chrome the soil presence of custom properties on the `:root` slows down the overall page layout even if no element consumes those custom properties.
* [Salesforce specific] Updating the custom property value should not require a stylesheet recompilation. In the context of Salesforce, the custom properties take the form of styling tokens stored in the database. We can't afford to recompile all the modules relying on those tokens since the compilation a CPU expensive operation.

## Design Details

Today the compiler ignores custom properties definition and usage. Therefore, custom properties should works as expected on all the compatible browsers without any changes to the compiler.

```css
/* Original CSS */
h1 {
    color: var(--text-color, red);
}
```

```js
/* Output scoped style with default config. */
export default function style(token) {
    return `
        h1[${token}] {
            color: var(--text-color, red);
        }
    `
}
```

In order to accommodate custom properties resolution, we will need to add a new optional config to the lwc compiler.

```ts
type CustomPropertiesResolution =
    | { type: 'native' }                    /* Use native custom properties. (Default value) */
    | { type: 'module', name: string };     /* Lookup custom properties from a module. */

interface StyleSheetConfig {
    customProperties?: {
        /**
         * Allow that stylesheet define new custom properties. (Default to "true")
         * This should always be set to "false" when resolution is set to "module", since with pre-compilation
         * custom properties doesn't cascade.
         */
        allowDefinition?: boolean;

        /** Defines the resolution strategy for custom properties. */
        resolution?: CustomPropertiesResolution;
    }
}
```

```js
/**
 * Output scoped style with config:
 * {
 *   stylesheetConfig: {
 *     customProperties: {
 *       resolution: { type: 'module', name: '@custom-properties' }
 *     }
 *   }
 * }
 */
import customProperties from '@custom-properties';

export default function style(token) {
    return `
        h1[${token}] {
            color: ${customProperties['--text-color'] || 'red'};
        }
    `
}
```

## Caveats

* Custom properties don't cascade. All the custom properties need to be defined statically outside.

## Alternatives

* Runtime polyfill: [`shadycss`](https://github.com/webcomponents/shadycss)
* Compile time transformation: [`postcss-custom-properties`](https://github.com/postcss/postcss-custom-properties)
