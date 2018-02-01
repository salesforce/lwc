# babel-plugin-transform-proxy-compat

This babel plugin enables Proxy usage in IE 11. In order to make this work, we have to rewrite property lookups, assignments, property deletions, function invocations, in statements and for in loops to use functions in order to execute the correct proxy handlers.

This package applies the following transformations:
- getKey - property lookup
  * `foo.bar` -> `getKey(foo, 'bar')`
- setKey - property assignment
  * `foo.bar = 'string'` -> `setKey(foo, 'bar', 'string)`
- callKey - function invocation
  * `foo.bar('argument')` -> `callKey(foo, 'bar', 'argument')`
- deleteKey - property deletion
  * `delete foo.bar` -> `deleteKey(foo, 'bar')`
- inKey - in keyword
  * `'bar' in foo` -> `inKey(foo, 'bar')`
- iterableKey - for in loops
  * `for (let foo in bar) {}` -> `for (let foo in iterableKey(bar)) {}`
- instanceOfKey - instanceof checks
  * `foo instanceof Bar` -> `instanceOfKey(foo, Bar)`


## Options

### `resolveProxyCompat`

`Object`, default to `{ module: 'proxy-compat' }`

Accepts either:
* `module` property with a `string` value when the proxy APIs should be retrieved from an external module.

```js
// Config
{ module: 'my-proxy-compat' }

// Result
import ProxyCompat from 'my-proxy-compat';
const callKey = ProxyCompat.callKey;
callKey(console, 'log', 'I am Compat');
```

* `global` property with a `string` value when the proxy APIs should be retrieved from a global variable.

```js
// Config
{ global: 'MyProxyCompat' }

// Result
const callKey = MyProxyCompat.callKey;
callKey(console, 'log', 'I am Compat');
```

* `independent` property with a `string` value when the proxy APIs should be retrieved from independent modules.

```js
// Config
{ independent: 'my-proxy-compat' }

// Result
import callKey from 'my-proxy-compat/callKey';
callKey(console, 'log', 'I am Compat');
```

## Disabling compat transform with comment

It's possible to disable the proxy compat transform for a specific file using the `/* proxy-compat-disable */` comment at the top of the file. This is an escape hatch for code that is performance sensitive and doesn't manipulate any Proxy. Make sure to use it extremely wisely.

```js
/* proxy-compat-disable */

function palindrome(str) {
    return str === str.split('').reverse().join('');
}
```
