# event-listener polyfill

This polyfill is needed for to support retargeting for synthetic shadow dom.

It will patch addEventListener and removeEventListener to make sure that whenever you are listning for an event at any level, that event is patched accordingly but only if the event is triggered from within a shadow root. If the event is not coming from a synthetic shadow, the event
don't need to be patched.
