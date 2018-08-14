# LWC Compiler

LWC Compiler is an open source project that can be used to compile a single Lightning Web Component bundle. There are several transformational phases that take place during compilation followed by a bundling phase. The Compiler utilizes [Rollup.js](https://rollupjs.org/guide/en) and its plugin system, which enables us  to change its  behaviour at key points in the bundling process. LWC compilation pipeline consists of the following plugins:

*Replace* - replace code ( ex: NODE.env.mode === ‘production’ will be replaced with true or false depending on the mode ).

*Module Resolution* - ensure that each local import in the component can be resolved. 

*Transformation* - apply LWC specific transformation to js, html, and css files.

*Compat* - apply the compatibility transformation ( ex: polyfills for older browsers ).

*Minify* - apply minification for ‘production’ mode  code.

These transformation may or may not be applied depending on the mode values specified in the compiler configuration object.
The compiler supports 4 modes of invocation: 'dev', 'prod', 'compat', 'prod_compat'.

The final phase of the compilation pipeline is bundling. During bundling, Rollup will ‘statically analyze and optimize the code you are importing, and will exclude anything that isn't actually used. This allows you to build on top of existing tools and modules without adding extra dependencies or bloating the size of your project’. 
The end result of the bundler is a single javascript file in a specified format - ‘amd’ by default.


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

### Compiler Configuration Eample

```js
const config = {
    name: "foo",
    namespace: "x",
    files: {
        "foo": `
          import { LightningElement, track } from 'lwc';
          export default class Foo extends from LightningElement {
            @track
            title = 'Foo Title';
          }
        `,
        "foo.html": `<template><h1>{title}</h1></template>`
    },
        outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: "amd"
    }
}
```

The compiler configuration object is always normalized to apply necessary defaults. However, the bundle configuration is a required input, which specifies a module name, namespace, type of the platform ( used to determine linting rules ), and a map of files to be compiled. Please note that the file value should be a string. If no outputConfig specified, compiler will produce a single result item with the following default output configuration:

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

### Compiler Invocation

```js
const { success, diagnostics, result: { code, metadata }, version } = await compile(config);
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
    decorators: MetadataDecorators;
    importLocations: ModuleImportLocation[];
    classMembers: ClassMember[];
    declarationLoc?: Location;
    doc?: string;
}

export type MetadataDecorators = Array<
    ApiDecorator | TrackDecorator | WireDecorator
>;

export interface ModuleImportLocation {
    name: string;
    location: Location;
}

export interface ClassMember {
    name: string;
    type: DecoratorTargetType;
    decorator?: string;
    doc?: string;
    loc?: Location;
}

export type DecoratorTargetType = DecoratorTargetProperty | DecoratorTargetMethod;
export type DecoratorTargetProperty = 'property';
export type DecoratorTargetMethod = 'method';

export interface NormalizedOutputConfig extends OutputConfig {
    compat: boolean;
    minify: boolean;
    env: {
        [name: string]: string;
    };
}
```

