# event-composed polyfill

This polyfill is needed for browsers without Event.prototype.composed descriptor to properly handling event re-targeting.

More details here:

-   https://dom.spec.whatwg.org/#dom-event-composed

This is a very dummy, simple polyfill for composed that patches `Event.prototype.composed` and replaces the global `CustomEvent` constructor with a new version that supports composed.

It also assumes that all standard events are `composed`, which is not accurate, but it is pretty close.
