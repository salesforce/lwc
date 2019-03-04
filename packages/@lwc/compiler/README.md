# LWC Compiler

lwc-compiler is an open source project that enables developers to take full control of processing a single Lightning Web Component module for runtime consumption.

## Installation

```sh
yarn install --save-dev lwc-compiler
```

## APIs

### `compile`

```js
import { compile } from 'lwc-compiler';

const options = {
    name: 'foo',
    namespace: 'x',
    files: {
        'foo.js': `
          import { LightningElement } from 'lwc';
          export default class Foo extends LightningElement {}
        `,
        'foo.html': `<template><h1>Foo</h1></template>`,
    },
};

const {
    success,
    diagnostics,
    result: { code },
} = await compile(options);

if (!success) {
    for (let diagnostic of diagnostics) {
        console.log(diagnostic.level + ':' + diagnostic.message);
    }
}

return code;
```

**Parameters:**

-   options (object) - the object which specifies compilation source and output shape
    -   `name` (string, required) - component name.
    -   `namespace` (string, required) - component namespace.
    -   `files` (BundleFiles, required) - key value pairs where each key is one of the bundle files and its value is a string value of the file content.
    -   `baseDir` (string, optional) - An optional directory prefix that contains the specified components. Only used when the component that is the compiler's entry point.
    -   `stylesheetConfig` (StylesheetConfig, optional) - css configuration.
    -   `outputConfig` (OutputConfig, optional) - compiler output configuratoin. Dictates the shape of the bunlde output (ex: bundle compiled for production mode, minified).

**Return**

-   output (object) - the object with the following fields:
    -   `success` (boolean) - compilation results (true only if all compilation steps were successful).
    -   `diagnostics` (Diagnostic[]) - an array of compilation `Diagnostic` objects (ex: warnings, errors)
    -   `result` (BundleResult) - an object containing compiled code, metadata, and configuration used during compilation;
    -   `version` (string) - the version of compiler used for current compilation.

### `transform`

Transform the content of individual file for manual bundling.

```js
import { transform } from 'lwc-compiler';

const source = `
    import { LightningElement } from 'lwc';
    export default class App extends LightningElement {}
`;

const filename = 'app.js';

const options = {
    namespace: 'c',
    name: 'app',
};

const { code } = await transform(source, filename, options);
```

**Parameters:**

-   `source` (string, required) - the source to be transformed can be the content of javascript, HTML, CSS.
-   `filename` (string, required) - the source filename with extension.
-   `options` (object, required) - the transformation options. The `name` and the `namespace` of the component is a minimum required for transformation.

**Return**

-   `code` (string)- the compiled source code.
-   `metadata` (object) - the metadata collected during transformation. Includes: `declarationLoc` and `experimentalTemplateDependencies`.
-   `map` (null) - not currenlty supported.

### `version`

```js
import { version } from 'lwc-compiler';

console.log(version);
```

**Return**

-   `version` (string) - the current version of the compiler ex: `0.25.1`.

## Compiler Interface

### Configuration Interface

Compiler can be configured to produce one bundle at a time with the following configurations:

```ts
export interface CompilerOptions {
    name: string;
    namespace: string;
    files: BundleFiles;
    /**
     * An optional directory prefix that contains the specified components
     * files. Only used when the component that is the compiler's entry point.
     */
    baseDir?: string;
    stylesheetConfig?: StylesheetConfig;
    outputConfig?: OutputConfig;
}

export interface BundleFiles {
    [filename: string]: string;
}

export interface StylesheetConfig {
    customProperties?: CustomPropertiesConfig;
}

export interface OutputConfig {
    env?: { [name: string]: string };
    compat?: boolean;
    minify?: boolean;
    resolveProxyCompat?: OutputProxyCompatConfig;
}

export type OutputProxyCompatConfig =
    | { global: string }
    | { module: string }
    | { independent: string };
```

### Compiler Configuration Example

```js
const config = {
    name: 'foo',
    namespace: 'x',
    files: {
        foo: `
          import { LightningElement, track } from 'lwc';
          export default class Foo extends from LightningElement {
            @track
            title = 'Foo Title';
          }
        `,
        'foo.html': `<template><h1>{title}</h1></template>`,
    },
    outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: 'amd',
    },
};
```

The compiler configuration object is always normalized to apply necessary defaults. However, the bundle configuration is always a required parameter, which specifies a module name, namespace, type of the platform (used to determine linting rules), and a map of files to be compiled. Please note that the file value should be a string. If no outputConfig specified, compiler will produce a single result item with the following default output configuration:

```ts
{
    outputConfig: {
        compat: false,
        minify: false,
        env: {
            NODE_ENV: 'development'
        },
    },
    stylesheeConfig: {
        customProperties: {
            allowDefinition: false,
            resolution: { type: 'native' }
        }
    }
}
```

### Compiler Output Interface

```ts
export interface CompilerOutput {
    success: boolean;
    diagnostics: Diagnostic[];
    result?: BundleResult;
    version: string;
}

export interface BundleResult {
    code: string;
    map: null;
    metadata: BundleMetadata;
    outputConfig: NormalizedOutputConfig;
}

export interface BundleMetadata {
    declarationLoc?: Location;
}

export interface ModuleImportLocation {
    name: string;
    location: Location;
    experimentalTemplateDependencies: ModuleExports[];
}

export interface NormalizedOutputConfig extends OutputConfig {
    compat: boolean;
    minify: boolean;
    env: {
        [name: string]: string;
    };
}
```

## Compiler Transformation and Bundling:

<img width="684" alt="screen shot 2018-08-23 at 4 14 28 pm" src="https://user-images.githubusercontent.com/7842674/44556674-b9d5ef00-a6ef-11e8-8225-6490329e10eb.png">

### Transformations

There are several transformational phases that take place during compilation followed by a bundling phase. The Compiler utilizes [Rollup.js](https://rollupjs.org/guide/en) and its plugin system, which enables us to change its behaviour at key points in the bundling process. LWC compilation pipeline consists of the following plugins:

_Replace_ - replace code (ex: process.env.NODE === ‘production’ will be replaced with true or false depending on the mode).

_Module Resolution_ - ensure that each local import in the component can be resolved.

_Transformation_ - apply LWC specific transformation to js, html, and css files.

_Compat_ - apply the compatibility transformation (ex: polyfills for older browsers).

_Minify_ - apply minification for ‘production’ mode code.

These transformation may or may not be applied depending on the mode values specified in the compiler configuration object.

### Bundling

The final phase of the compilation pipeline is bundling. During bundling, Rollup will ‘statically analyze and optimize the code you are importing, and will exclude anything that isn't actually used. This allows you to build on top of existing tools and modules without adding extra dependencies or bloating the size of your project’.
The end result of the bundler is a single javascript file in a specified format - ‘amd’ by default.
