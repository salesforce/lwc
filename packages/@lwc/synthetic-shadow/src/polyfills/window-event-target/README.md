# window-event-target polyfill

This polyfill is needed to support re-targeting for synthetic shadow dom.

It will patch addEventListener and removeEventListener on `Window.prototype` in IE11 to make sure that whenever you are listening for an event at the window level, that event can only be observed if it is composed, or it is coming from a non-shadowed node.
