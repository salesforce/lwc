# @lwc/rollup-plugin

Rollup plugin to compile LWC

## Installation

```sh
yarn add --dev @lwc/rollup-plugin
```

Note that both `@lwc/engine` and `@lwc/compiler` are peer dependencies of this plugin that need to be installed separately.

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

-   `rootDir` (string, optional, default: `input`) - set the LWC module directory
-   `sourcemap` (boolean, optional, default: `false`) - make the LWC compiler produce source maps
-   `resolveFromPackages` (boolean, optional, default: `true`) - let the rollup plugin resolve modules from the `node_modules` directory
-   `stylesheetConfig` (object, optional, default: `{}`) - the configuration to pass to the `@lwc/style-compiler`
