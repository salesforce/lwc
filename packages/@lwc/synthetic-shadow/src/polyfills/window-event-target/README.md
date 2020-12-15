# window event target polyfill

This polyfill is specifically for IE11. Please remove if we ever stop supporting it.

We patch `Window.prototype` in this polyfill because the corresponding methods on the `window`
instance are defined on the `Window` interface.
