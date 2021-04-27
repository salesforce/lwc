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

-   `rootDir` (string, optional, default: `input directory`) - set the LWC module directory
-   `sourcemap` (boolean, optional, default: `false`) - make the LWC compiler produce source maps
-   `modules` Mapping of module specifiers.
-   `stylesheetConfig` (object, optional, default: `{}`) - the configuration to pass to the `@lwc/style-compiler`
-   `preserveHtmlComments` (boolean, optional, default: `false`) - the configuration to pass to the `@lwc/template-compiler`
