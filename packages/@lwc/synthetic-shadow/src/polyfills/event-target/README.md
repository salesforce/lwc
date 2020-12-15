# event target polyfill

In all the modern browsers we support, `addEventListener()`, `removeEventListener()`, and
`dispatchEvent()` are defined on the `EventTarget` interface. In IE11, these methods are defined
on the `Node` interface, and so we alternatively patch `Node.prototype` in the case that
`EventTarget` is not defined.

This polyfill currently hooks into listener invocations via `addEventListener()` in order to
filter events based on their bubbles/composed configuration.
