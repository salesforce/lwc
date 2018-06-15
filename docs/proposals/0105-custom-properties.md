# RFC: CSS Custom Properties

## Status

- Start Date: 2018-06-13
- RFC PR: https://github.com/salesforce/lwc/pull/412

## Summary

> This RFC defines the changes that need to be made to the LWC compiler to accommodate the usage of custom properties.

## Motivation

Because of the Shadow DOM, it's impossible to style components from the outside. The shadow DOM tree inherits its CSS properties from its host element. Custom properties provide a way to add a styling API to a component since custom properties traverse the Shadow DOM boundaries.

Even if customProperties is a [standard CSS feature](https://drafts.csswg.org/css-variables), this platform feature is not yet supported by all the LWC targetted browser (ie. IE11).

## Custom Property usage

This section outlines how custom properties work.

A custom property is a name starting with `--` (double hyphen), like `--text-color`. Like any ordinary property, custom properties can be defined on any element and follow the same cascading rules.

The consumption of the custom properties is done via the `var()` function. This CSS function accepts 2 arguments: a required custom property name and an optional fallback value.

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

## Requirements

* IE11 doesn't support custom properties syntax.
* A large number of custom properties can be harmful in terms of rendering performance. In Chrome the mere presence of custom properties on the `:root` slows down the overall page layout even if no element consumes those custom properties.
* [Salesforce specific] Updating the custom property value should not require a stylesheet recompilation. In the context of Salesforce, the custom properties take the form of styling tokens stored in the database. We can't afford to recompile all the modules relying on those tokens since the compilation is a CPU expensive operation.

## Design Details

Today the compiler ignores custom properties definition and usage. Therefore, custom properties should work as expected on all the compatible browsers without any changes to the compiler.

```css
/* Original CSS */
h1 {
    color: var(--text-color);
    background-color: var(--bg-color, green);
}
```

```js
/* Output scoped style with default config. */
export default function style(token) {
    return `
        h1[${token}] {
            color: var(--text-color);
            background-color: var(--bg-color, green);
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
         * Control whether new custom properties are allowed to be defined on a stylesheet. (Default to "true")
         * This should always be set to "false" when resolution is set to "module", since with pre-compilation
         * custom properties don't cascade.
         */
        allowDefinition?: boolean;

        /** Defines the resolution strategy for custom properties. */
        resolution?: CustomPropertiesResolution;
    }
}
```

When the custom property resolution startegy is set to `module`, instead of relying on the native custom properties behavior, the [var substitution](https://drafts.csswg.org/css-variables/#substitute-a-var) is done at runtime prior the injection of the stylesheet in the DOM.

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
            color: ${customProperties['--text-color'] || 'invalid--text-color'};
            background-color: ${customProperties['--bg-color'] || 'green'};
        }
    `
}
```

The `name` property defined the module identifier, the custom properties should be resolved from. This module should export by default an object where the keys are the custom properties name and the values are the custom properties values.

```js
export default {
    '--text-color': 'blue',
    '--bg-color': 'yellow',
};
```

In the generated javascript code the `var()` substitution is done via a OR logical expression (`||`):
* the left-hand side expression is a member expression to lookup the custom property value in the custom properties object.
* the right-hand side expression is:
    * if no fallback value is provided, a string literal with the value of the custom property name with `invalid` (see: [Caveats - Invalid Variables](#invalid-variables)).
    * else, a string literal with the value of the fallback. If there is any reference to `var()` in the fallback, the `var()` should also be substituted.

```js
// No fallback: var(--text-color);
customProperties['--text-color'] || 'invalid--text-color';

// Fallback: var(--text-color, red);
customProperties['--text-color'] || 'red';

// Fallback with reference to var: var(--text-color, var(--default-color));
customProperties['--text-color'] || customProperties['--default-color'] || 'invalid--default-color';


// Complex fallback with reference to var: var(--box-margin, var(--box-margin-top) 1rem var(--box-margin-bottom));
customProperties['--box-margin'] || `${customProperties['--box-margin-top'] || 'invalid--box-margin-top'} 1 rem ${customProperties['--box-margin-bottom'] || 'invalid--box-margin-bottom'}`;
```


## Caveats

### Cascading and Updates

Since substitution is done prior injection in the DOM, custom properties doesn't support cascading and dynamic updates from javascript.

### Invalid Variables

According to the spec, the substitution of the custom property with its initial value makes the declaration invalid. An invalid variable is equivalent to the `unset` value ([spec](https://drafts.csswg.org/css-variables/#invalid-variables)).

To minimize the discrepancies between the browsers an invalid variable is substituted with CSS keyword formed with the custom property name prefixed with `invalid`. This approach is privileged over:

* the `unset` keyword, which is not supported by IE11. This would make the result of the substitution inconsistent between browsers.
* to an empty string (`''`), since the `var()` substitution with an empty string can lead to unexpected behavior. Take for example: `margin: 10px var(--missing-variable);`, if the the `var()` gets substituted with an empty string the resulted declaration (`margin: 10px ;`) is a valid declaration with a different semantic than the original declaration. The substitution with an invalid CSS keyword (`margin: 10px invalid--missing-variable;`) would indicate to the CSS parser that is declaration is invalid. The result of this approach has both benefit to be closer to the original spec behavior while easing the debuggability of the of invalid variables.

## Alternatives

* Runtime polyfill: [`shadycss`](https://github.com/webcomponents/shadycss)
* Compile time transformation: [`postcss-custom-properties`](https://github.com/postcss/postcss-custom-properties)
