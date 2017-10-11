# babel-plugin-transform-raptor-compat

This babel plugin enables Proxy usage in IE 11. In order to make this work, we have to rewrite property lookups, assignments, property deletions, function invocations, in statements and for in loops to use functions in order to execute the correct proxy handlers.

This package injects up to 6 functions inside of each module:
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


** Resolving injected functions

This package is only responsible for rewriting code for compat mode and as a result, does not contain any runtime function definitions. By default, this package will grab compat functions from window.Proxy:

```
// Injects
const {
    setKey: _setKey,
    callKey: _callKey,
    getKey: _getKey,
    deleteKey: _deleteKey,
    iterableKey: _iterableKey,
    inKey: _inKey,
    instanceOfKey: _instanceOfKey
} = window.Proxy;
```

If `window.Proxy` is not desireable, this transform can be configured to another global:
```
// Babel config
const BABEL_CONFIG = {
    plugins: [
        [transfromRaptorCompat, {
            resolveProxyCompat: {
                global: 'window.COMPAT'
            }
        }]
    ]
};

// Injects
const {
    setKey: _setKey,
    callKey: _callKey,
    getKey: _getKey,
    deleteKey: _deleteKey,
    iterableKey: _iterableKey,
    inKey: _inKey,
    instanceOfKey: _instanceOfKey
} = window.COMPAT;
```
