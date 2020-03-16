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

const result = resolveModule('x-foo', './index.js');
console.log(result);
```

**Parameters:**

-   `specifier` (string, required): The module specifier that should be resolved.
-   `importer` (string, required): The file importing the module. This file is used an the entry point from where the `specifier` should be resolved.
-   `options` (object, optional):
    -   `rootDir` (string, optional): TODO
    -   `modules` (`ModuleRecord`, optional): TODO
