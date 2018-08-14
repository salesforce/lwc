# LWC Compiler

LWC Compiler is an open source compiler that can be used to compiler a single Lightning Web Component bundle into a single javasrcipt file.

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

### Compiler Output Example:

```js

```
