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

-   `include` (`string | string[]`, default: `null`) - A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should transform on. By default all files are targeted.
-   `exclude` (`string | string[]`, default: `null`) - A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should not transform. By default no files are ignored.
-   `rootDir` (string, optional, default: `input directory`) - The LWC root module directory.
-   `sourcemap` (boolean, optional, default: `false`) - If `true
-   `modules` - Mapping of module specifiers.
-   `stylesheetConfig` (object, optional, default: `{}`) - the configuration to pass to the `@lwc/style-compiler`
