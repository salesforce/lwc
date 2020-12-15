# window event target polyfill

This polyfill is specifically for IE11. Please remove if we ever stop supporting it.

In all the modern browsers we support, `addEventListener()`, `removeEventListener()`, and
`dispatchEvent()` are defined on the `EventTarget` interface. In IE11, these methods are defined
on the `Node` interface, and so our event target polyfill ends up patching `Node.prototype` in
the case that `EventTarget` is not defined.

IE11 throws us yet another curveball where `window` is not an instance of `Node`, so we cover our
bases in this polyfill by additionally patching `Window.prototype`.
