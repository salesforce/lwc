# @lwc/module-resolver

Implements the LWC [module resolver](#module-resolution) algorithm.

## Installation

```sh
npm install --save-dev @lwc/module-resolver
```

## APIs

### `resolveModule(specifier, importer, options)`

Synchronously resolve an LWC module from its specifier from a importer.

```js
import { resolveModule } from '@lwc/module-resolver';

const result = resolveModule('x/foo', './index.js');
console.log(result);
```

If in the middle of the module resolution the resolver process an invalid configuration the resolver throw an error with the `LWC_CONFIG_ERROR` error code. If a module can't be resolved from the given importer the invocation throw an error with the `NO_LWC_MODULE_FOUND` error code.

```js
import { resolveModule } from '@lwc/module-resolver';

let result;
try {
    result = resolveModule('x/foo', './index.js');
} catch (err) {
    if (err.code === 'LWC_CONFIG_ERROR') {
        console.error(`The request module can't be resolved due to an invalid configuration`, err);
    } else if (err.code === 'NO_LWC_MODULE_FOUND') {
        console.error(`The requested module doesn't exists`, error);
    } else {
        throw err;
    }
}

console.log(result);
```

**Parameters:**

-   `specifier` (string, required): The module specifier that should be resolved.
-   `dirname` (string, required): The directory from where the specifier should be resolved.
-   `options` (object, optional):
    -   `modules` (ModuleRecord[], optional, default: `[]`): Injects module records to the resolved resolved configuration.
    -   `rootDir` (string, optional, default: `process.cwd()`): Should only be used when the `modules` option is set. Defines from where the modules overrides should be resolved.

**Return value:**

A `RegistryEntry` representing the resolved module with the following properties:

-   `entry` (string): The absolute path of the module entry point.
-   `specifier` (string): The resolved module specifier.
-   `scope` (string): The absolute path from where the module has been resolved.

## Module resolution

The LWC compiler does use a custom resolution algorithm to resolve LWC modules. The module resolution can be configured via the `lwc.config.json` or by adding a new `lwc` property on the `package.json`. The `modules` property accepts an array of `ModuleRecord` that can be of 3 types:

-   [Alias resolution](#alias-resolution): Defines a specifier that points to a specific module.
-   [Directory resolution](#directory-resolution): Defines a folder where LWC modules can be resolved.
-   [NPM package resolution](#npm-package-resolution): Defines an NPM packages that will hold one or more LWC modules to be resolved.

```json
// lwc.config.json
{
    "modules": [
        {
            "name": "ui/button",
            "path": "src/modules/ui/button/button.js"
        },
        {
            "dir": "src/modules"
        },
        {
            "npm": "@ui/components"
        }
    ]
}
```

The module resolver iterate through the `module` until resolving the first matching module.

### Alias resolution

### Directory resolution

### NPM package resolution

### Exposing LWC modules via NPM packages
