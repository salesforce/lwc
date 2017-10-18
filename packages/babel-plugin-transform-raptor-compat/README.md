# babel-plugin-transform-raptor-compat

This babel plugin enables Proxy usage in IE 11. In order to make this work, we have to rewrite property lookups, assignments, property deletions, function invocations, in statements and for in loops to use functions in order to execute the correct proxy handlers.

This package injects up to 7 functions inside of each module:
- getKey - property lookup
  * `foo.bar` -> `getKey(foo, 'bar')`
- setKey - property assignment
  * `foo.bar = 'string'` -> `setKey(foo, 'bar', 'string)`
- callKey - function invokcation
  * `foo.bar('argument')` -> `callKey(foo, 'bar', 'argument')`
- deleteKey - property deletion
  * `delete foo.bar` -> `deleteKey(foo, 'bar')`
- inKey - in keyword
  * `'bar' in foo` -> `inKey(foo, 'bar')`
- iterableKey - for in loops
  * `for (let foo in bar) {}` -> `for (let foo in iterableKey(bar)) {}`
- instanceOfKey - instanceof checks
  * `foo instanceof Bar` -> `instanceOfKey(foo, Bar)`


## Resolving injected functions

This package is only responsible for rewriting code for compat mode and as a result, does not contain any runtime function definitions. By default, an import statement pointing to `proxy-compat` package will be used for the functions:

```js
import { getKey as _getKey } from "proxy-compat";
import { setKey as _setKey } from "proxy-compat";
import { callKey as _callKey } from "proxy-compat";
//...
```

There are cases where we may want the compat functions to come from the global object (window) instead of another module. In this instance we can use the `resolveProxyCompat` option to resolve functions to a global:

```js
// Babel config
const BABEL_CONFIG = {
    plugins: [
        [transfromRaptorCompat, {
            resolveProxyCompat: {
                global: 'window.Proxy'
            }
        }]
    ]
};

// Resulting in
const {
    getKey: _getKey,
    setKey: _setKey,
    callKey: _callKey,
    // ...
} = window.Proxy;
```

## Options

### `resolveProxyCompat`

`Object`, default to `{ module: 'proxy-compat' }`

Accepts either:
* `module` property with a `string` value when the proxy APIs should be retrieved from an external module
* `global` proerty with a `string` value when the proxy APIs should be retrieved from a global variable
