# event-listener polyfill

This polyfill is needed to support re-targeting for synthetic shadow dom.

It will patch addEventListener and removeEventListener to make sure that whenever you are listening for an event at any level, that event is patched accordingly but only if the event is triggered from within a shadow root. If the event is not coming from a synthetic shadow, the event
don't need to be patched.
