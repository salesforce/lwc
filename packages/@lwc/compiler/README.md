# LWC Compiler

## Summary

@lwc/compiler is an open source project that enables developers to take full control of processing a single Lightning Web Components module for runtime consumption.

## Installation

```sh
npm install @lwc/compiler
```

## APIs

### `transformSync`

Transform the content of individual file.

```js
import { transformSync } from '@lwc/compiler';

const source = `
    import { LightningElement } from 'lwc';
    export default class App extends LightningElement {}
`;

const filename = 'app.js';

const options = {
    namespace: 'c',
    name: 'app',
};

const { code } = transformSync(source, filename, options);
```

**Parameters:**

-   `source` (string, required) - the source to be transformed. Can be the content of a JavaScript, HTML, or CSS file.
-   `filename` (string, required) - the source filename with extension.
-   `options` (object, required) - the transformation options. The `name` and the `namespace` of the component is a minimum required for transformation.
    -   `name` (type: `string`, required) - name of the component, e.g. `foo` in `x/foo`.
    -   `namespace` (type: `string`, required) - namespace of the component, e.g. `x` in `x/foo`.
    -   `stylesheetConfig` (type: `object`, default: `{}`) - The stylesheet compiler configuration to pass to the `@lwc/style-compiler`.
    -   `experimentalDynamicComponent` (type: `DynamicImportConfig`, default: `null`) - The configuration to pass to `@lwc/compiler`.
    -   `experimentalDynamicDirective` (type: `boolean`, default: `false`) - The configuration to pass to `@lwc/template-compiler` to enable deprecated dynamic components.
    -   `enableDynamicComponents` (type: `boolean`, default: `false`) - The configuration to pass to `@lwc/template-compiler` to enable dynamic components.
    -   `outputConfig` (type: `object`, optional) - see below:
        -   `sourcemap` (type: `boolean`, optional) - if `true`, a sourcemap is generated for the transformed file.
        -   `minify` (type: `boolean`, optional, deprecated) - this option has no effect.
    -   `experimentalComplexExpressions` (type: `boolean`, optional) - set to true to enable use of (a subset of) JavaScript expressions in place of template bindings. Passed to `@lwc/template-compiler`.
    -   `isExplicitImport` (type: `boolean`, optional) - true if this is an explicit import, passed to `@lwc/babel-plugin-component`.
    -   `preserveHtmlComments` (type: `boolean`, default: `false`) - The configuration to pass to the `@lwc/template-compiler`.
    -   `scopedStyles` (type: `boolean`, optional) - True if the CSS file being compiled is a scoped stylesheet. Passed to `@lwc/style-compiler`.
    -   `enableStaticContentOptimization` (type: `boolean`, optional) - True if the static content optimization should be enabled. Passed to `@lwc/template-compiler`.
    -   `customRendererConfig` (type: `object`, optional) - custom renderer config to pass to `@lwc/template-compiler`. See that package's README for details.
    -   `enableLightningWebSecurityTransforms` (type: `boolean`, default: `false`) - The configuration to enable Lighting Web Security specific transformations.
    -   `enableLwcSpread` (boolean, optional, `true` by default) - Deprecated. Ignored by compiler. `lwc:spread` is always enabled.
    -   `disableSyntheticShadowSupport` (type: `boolean`, default: `false`) - Set to true if synthetic shadow DOM support is not needed, which can result in smaller output.
    -   `instrumentation` (type: `InstrumentationObject`, optional) - instrumentation object to gather metrics and non-error logs for internal use. See the `@lwc/errors` package for details on the interface.
    -   `apiVersion` (type: `number`, optional) - API version to associate with the compiled module.

**Return**

-   `code` (string) - the compiled source code.
-   `map` (object) - the generated source map.
-   `warnings` (array, optional) - the array of diagnostic warnings, if any.
-   `cssScopeTokens` (array, optional) - String tokens used for style scoping in synthetic shadow DOM and `*.scoped.css` (as either attributes or classes), if any.

### `transform` (deprecated)

Deprecated asynchronous equivalent of `transformSync`.

### `version`

```js
import { version } from '@lwc/compiler';

console.log(version);
```

**Return**

-   `version` (string) - the current version of the compiler ex: `0.25.1`.
