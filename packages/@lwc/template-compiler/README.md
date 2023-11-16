# @lwc/template-compiler

Compile LWC HTML template for consumption at runtime.

## Installation

```sh
yarn add --dev @lwc/template-compiler
```

## Usage

```js
import { compile } from '@lwc/template-compiler';

const options = {};
const { code, warnings } = compile(
    `
    <template>
        <h1>Hello World!</h1>
    </template>
`,
    options
);

for (let warning of warnings) {
    console.log(warning.message);
}

console.log(code);
```

## APIs

### `compile`

Compile a LWC template to javascript source code consumable by the engine.

```js
import { compile } from '@lwc/template-compiler';
const { code, warnings } = compile(`<template><h1>Hello World!</h1></template>`, {});
```

**Parameters:**

-   `source` (string, required) - the HTML template source to compile.
-   `options` (object, required) - the options to used to compile the HTML template source.

**Options:**

-   `experimentalComputedMemberExpression` (boolean, optional, `false` by default) - set to `true` to enable computed member expression in the template, eg: `{list[0].name}`.
-   `experimentalComplexExpressions` (boolean, optional, `false` by default) - set to `true` to enable use of (a subset of) JavaScript expressions in place of template bindings.
-   `experimentalDynamicDirective` (boolean, optional, `false` by default) - set to `true` to allow the usage of `lwc:dynamic` directives in the template.
-   `enableDynamicComponents` (boolean, optional, `false` by default) - set to `true` to enable `lwc:is` directive in the template.
-   `preserveHtmlComments` (boolean, optional, `false` by default) - set to `true` to disable the default behavior of stripping HTML comments.
-   `enableStaticContentOptimization` (boolean, optional, `true` by default) - set to `false` to disable static content optimizations.
-   `enableLwcSpread` (boolean, optional, `true` by default) - Deprecated. Ignored by template-compiler. `lwc:spread` is always enabled.
-   `customRendererConfig` (CustomRendererConfig, optional) - specifies a configuration to use to match elements. Matched elements will get a custom renderer hook in the generated template.
-   `instrumentation` (InstrumentationObject, optional) - instrumentation object to gather metrics and non-error logs for internal use. See the `@lwc/errors` package for details on the interface.

    -   Example 1: Config to match `<use>` elements under the `svg` namespace and have `href` attribute set.

        ```
        {
            customRendererConfig: {
                directives: [],
                elements: [
                    {
                        tagName: 'use',
                        namespace: 'http://www.w3.org/2000/svg',
                        attributes: ['href']
                    }
                ]
            }
        }
        ```

    -   Example 2: Config to match `<script>` elements regardless of the attribute set. _Note:_ When `attributes` is not specified, attribute matching is skipped.
        ```
        {
            customRendererConfig: {
                directives: [],
                elements: [
                    {
                        tagName: 'script'
                    }
                ]
            }
        }
        ```

-   `apiVersion` (type: `number`, optional) - API version to associate with the compiled template.

**Return:**
The method returns an object with the following fields:

-   `code` (string) - the compiled template.
-   `warnings` (array) - the list of warnings produced when compiling the template. Each warning has the following fields:
    -   message (string) - the warning message.
    -   level (string) - the severity of the warning: `info`, `warning`, `error`.
    -   start (number) - the start index in the source code producing the warning.
    -   length (number) - the character length in the source code producing the warning.
