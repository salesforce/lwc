# @lwc/module-resolver

Implements the LWC module resolver algorithm.

## Installation

```sh
npm install --save-dev @lwc/module-resolver
```

## APIs

### `resolveModule(specifier, importer, options)`

Synchronously resolve an LWC module from its specifier.

```js
import { resolveModule } from '@lwc/module-resolver';

const result = resolveModule('x/foo', './index.js');
console.log(result);
```

**Parameters:**

-   `specifier` (string, required): The module specifier that should be resolved.
-   `dirname` (string, required): The directory from where the specifier should be resolved.
-   `options` (object, optional):
    -   `modules` (ModuleRecord[], optional, default: `[]`): Injects module records to the resolved resolved configuration.
    -   `rootDir` (string, optional, default: `process.cwd()`): Should only be used when the `modules` option is set. Defines from where the modules overrides should be resolved.
