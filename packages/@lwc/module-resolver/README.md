# @lwc/module-resolver

Implements the LWC [module resolver](#module-resolution) algorithm.

## Installation

```sh
npm install --save-dev @lwc/module-resolver
```

## APIs

### `resolveModule(specifier, importer, options)`

Synchronously resolves an LWC module specifier from an import path.

```js
import { resolveModule } from '@lwc/module-resolver';

const result = resolveModule('x/foo', './index.js');
console.log(result);
```

If the resolver processes an invalid configuration, it throws an error with the `LWC_CONFIG_ERROR` error code. If the resolver can't locate the module, it throws an error with the `NO_LWC_MODULE_FOUND` error code.

```js
import { resolveModule } from '@lwc/module-resolver';

let result;
try {
    result = resolveModule('x/foo', './index.js');
} catch (err) {
    if (err.code === 'LWC_CONFIG_ERROR') {
        console.error(`The request module can't be resolved due to an invalid configuration`, err);
    } else if (err.code === 'NO_LWC_MODULE_FOUND') {
        console.error(`The requested module doesn't exists. `, err);
    } else {
        throw err;
    }
}

console.log(result);
```

**Parameters:**

- `specifier` (string, required): The module specifier to resolve.
- `importer` (string, required): The file from where the resolution starts.
- `options` (object, optional):
    - `modules` (ModuleRecord[], optional, default: `[]`): Injects module records to the resolved configuration.
    - `rootDir` (string, optional, default: `process.cwd()`): Use only when the `modules` option is set. Modules overrides are resolved from this directory.

**Return value:**

A `RegistryEntry` representing the resolved module with the following properties:

- `entry` (string): The absolute path of the module entry point.
- `specifier` (string): The resolved module specifier.
- `scope` (string): The absolute path from where the module has been resolved.

## Module resolution

The LWC compiler uses a custom resolution algorithm to resolve LWC modules. To configure module resolution, use the `lwc.config.json` file or the `lwc` key in the `package.json` file. The `modules` key accepts an array of module records. The resolver iterates through the `modules` array and returns the first module that matches the requested module specifier. There are three types of module record:

- [Alias module record](#alias-module-record): A file path where an LWC module can be resolved.
- [Directory module record](#directory-module-record): A folder path where LWC modules can be resolved.
- [NPM package module record](#npm-package-module-record): An NPM package that exposes one or more LWC modules.

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

### Module record types

#### Alias module record

An alias module record maps a module specifier to a file path. An alias module record is defined by two keys:

- `name` (string, required): The LWC module specifier.
- `path` (string, required): The file path to resolve.

In this example, the `ui/button` LWC module specifier is resolved from the `src/modules/ui/button/button.js` path.

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

A directory module record specifies a folder path where LWC modules are resolved. A directory module record is defined by one key:

- `dir` (string, required): The directory path containing the modules.

```json
{
    "modules": [
        {
            "dir": "src/modules"
        }
    ]
}
```

The directory module record uses an opinionated folder structure to resolve LWC modules. The directory path can contain one or multiple folders representing the LWC modules `namespace`. Each of those namespace folders can contain one or multiple folders representing the different LWC modules in the namespace. The name of the folder defines the LWC module `name`. For a module to be resolved, the LWC module folder must have a file matching the LWC module name, this file is the LWC module entry point.

In this example, if the `dir` key is set `src/modules`, the following LWC modules can be resolved: `ui/button`, `ui/icons`, `shared/utils`.

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

An NPM package module record tells the resolver that a given NPM package exposes resolvable LWC modules. More details about how to expose LWC modules out of an NPM package can be found in [this section](#exposing-lwc-modules-via-npm-packages). An NPM package module record is defined by one key:

- `npm` (string, required): The NPM package name exposing the LWC modules.

In this example, the resolver is told to look into the `@ui/components` NPM package to look up LWC modules.

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

To distribute an LWC module publicly via an NPM package, the package should follow the same the [LWC module resolution](#module-resolution) rules. The NPM package should either have the `lwc.config.json` file in its root directory or the `lwc` key in its `package.json` describing how LWC modules are resolved relative to this package.

By default, an LWC module is not exposed outside of an NPM package. The LWC configuration must explicitly list the public LWC modules on the `expose` key.

In this example, the package makes the `ui/button` and `ui/icon` LWC modules public.

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
