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

The LWC compiler does use a custom resolution algorithm to resolve LWC modules. The module resolution can be configured via the `lwc.config.json` or via the `lwc` key on the `package.json`. The `modules` key accepts an array of module records that can be of three different types:

-   [Alias module record](#alias-module-record): Define a file path where an LWC module can be resolved.
-   [Directory module record](#directory-module-record): Defines a folder path where LWC modules can be resolved.
-   [NPM package module record](#npm-package-module-record): Defines an NPM packages that will expose one or more LWC modules.

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

### Module records

#### Alias module record

An alias module record maps a module specifier to file path where it can be resolved from. An alias module record is defined by two keys:

-   `name` (string, required): The LWC module specifier.
-   `path` (string, required): The path file path to resolve.

In this example the `ui/button` LWC module specifier can be resolved from the `src/modules/ui/button/button.js` path.

```json
{
    "modules": [
        {
            "name": "ui/button",
            "path": "src/modules/ui/button/button.js"
        }
    ]
}
```

#### Directory module record

A directory module record specifies a folder path where LWC modules can be resolved from. A directory module record is defined by one key:

-   `dir` (string, required): The directory path containing the modules.

```json
{
    "modules": [
        {
            "dir": "src/modules"
        }
    ]
}
```

The directory module record is opinionated in terms of the folder structure. The directory path can contain one of multiple folders representing the LWC modules `namespace`. Each of those namespace folders can contain one or multiple directories with the LWC modules `name`. For a module to be resolved, the LWC module folder should have a file matching the LWC module name. In this example, if the `dir` key is set `src/modules`, the following LWC modules can be resolved: `ui/button`, `ui/icons`, `shared/utils`.

```
src
└── modules/
    ├── ui/
    │   ├── button/
    │   │   ├── button.js
    │   │   └── button.html
    │   └── icon/
    │       └── icon.js
    └── shared/
        └── utils/
            └── utils.js
```

#### NPM package module record

An NPM package module records tells the resolver than a given NPM package expose LWC modules than can be resolved. An NPM package module record is defined by one key:

-   `npm` (string, required): The NPM package name exposing the LWC modules.

In this example, the resolver is told to look into the `@ui/components` npm package to look up for LWC modules.

```json
{
    "modules": [
        {
            "npm": "@ui/components"
        }
    ]
}
```

### Exposing LWC modules via NPM packages

By default no LWC modules is exposed outside NPM packages. In order to distribute LWC modules via NPM packages, the LWC configuration should list all the public LWC modules on the `expose` key.

```json
{
    "modules": [
        {
            "dir": "src/modules"
        }
    ],
    "expose": ["ui/button", "ui/icon"]
}
```
