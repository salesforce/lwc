# focus-event-composed polyfill

Fix for FF not composing `focusout` and `focusin` events. This must be run AFTER our event-composed polyfill.

More details here:

-   https://bugzilla.mozilla.org/show_bug.cgi?id=1472887

This polyfill assumes that user-generated focus events are always composed: true.
