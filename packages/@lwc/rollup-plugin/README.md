# @lwc/rollup-plugin

Rollup plugin to compile LWC

## Installation

```sh
yarn add --dev @lwc/rollup-plugin
```

## Usage

```js
// rollup.config.js
import rollupPlugin from '@lwc/rollup-plugin';

export default {
    input: './src/main.js',
    plugins: [rollupPlugin()],
};
```

## Options

-   `include` (type: `string | string[]`, default: `null`) - A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should transform on. By default all files are targeted.
-   `exclude` (type: `string | string[]`, default: `null`) - A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should not transform. By default no files are ignored.
-   `rootDir` (type: `string`, default: rollup `input` directory) - The LWC root module directory.
-   `sourcemap` (type: `boolean`, default: `false`) - If `true` the plugin will produce source maps.
-   `environment` (type: `'dom' | 'server'`, default: `dom`) - The target LWC engine environment.
-   `modules` (type: `ModuleRecord[]`, default: `[]`) - The module resolution overrides passed to the `@lwc/module-resolver`.
-   `stylesheetConfig` (type: `object`, default: `{}`) - The stylesheet compiler configuration to pass to the `@lwc/style-compiler`.
