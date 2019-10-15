# event-target polyfill

This polyfill is needed to support re-targeting for synthetic shadow dom.

It will patch addEventListener and removeEventListener on `EventTarget.prototype` (and `Node.prototype` in IE11) to make sure that whenever you are listening for an event, that event can only be observed if it follows the shadow dom retargeting logic.
