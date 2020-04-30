# click-event-composed polyfill

This polyfill is needed to work around a Safari bug where click events are
not composed when generated as a result of invoking the click method.

Bug: https://bugs.webkit.org/show_bug.cgi?id=170211

This polyfill has a known limitation where click events passed to handlers
which are bound directly on the target are not patched. This is due to order
in which browsers invoke event handlers and the hook this polyfill uses to
patch the click event.

https://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/events.html#Events-listeners-registration
