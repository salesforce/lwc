# Proxy Compat

This package provides a replacement for the global `Proxy` reference with a half-baked implementation that requires the user-land code to be transpile accordingly to be able to fully replicate the ES6 Proxy semantics.

The transpilation step is not trivial, and we plan to provide few plugins for the various transpilers to help with that.

Disclaimer: The end goal is not to provide a high-performant output, but an output that is fully compatible with ES5 runtimes.

### Transpilation Step

The following 6 rules must be applied to the user-land code:

1. member expressions e.g.: `obj.x.y.z` => `Proxy.getKey(Proxy.getKey(Proxy.getKey(obj, 'x'), 'y'), 'z')`
2. assignment of member expressions e.g.: `obj.x.y = 1;` => `Proxy.setKey(Proxy.getKey(obj, 'x'), 'y', 1)`
3. delete operator e.g.: `delete obj.x.y` => `Proxy.deleteKey(Proxy.getKey(obj, 'x'), 'y')`
4. in operator e.g.: `"y" in obj.x` => `Proxy.inKey(getKey(obj, 'x'), 'y')`
5. for in operator e.g.: `for (let i in obj)` => `for (let i in Proxy.iterableKey(obj))`
6. function invocation e.g.: `obj.x.y(1, 2);` => `Proxy.callKey(Proxy.getKey(obj, 'x'), 'y', 1, 2)`

### Usage

This package provides 3 outputs:

* CJS to require the new `Proxy` reference from any node module: `var Proxy = require('proxy-compat')`.
* ES6 to import the new `Proxy` reference from any ES Module: `import Proxy from "proxy-compat"`.
* Load the script from `dist/proxy-compat.js` into your browser, which defines `window.Proxy` to use this implementation.
