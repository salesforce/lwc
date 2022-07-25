# event target polyfill

In all the modern browsers we support, `addEventListener()`, `removeEventListener()`, and
`dispatchEvent()` are defined on the `EventTarget` interface.

This polyfill currently hooks into listener invocations via `addEventListener()` in order to
filter events based on their bubbles/composed configuration.
