# Synthetic Shadow Root

## Summary

This is a polyfill for ShadowRoot that was tailor-made for LWC in order to meet the performance goals of the Lightning Platform. This doesn't mean that it cannot be used with any other framework, but we took shortcuts and made compromises that might not align well with other frameworks.

## Compromises

-   Default content for `<slot>` elements is always empty.
-   `slotchange` is only available directly on the slot (it doesn't bubble as in the case of the native implementation)
-   Dispatch events directly on the ShadowRoot instance are not allowed because they will always leak into the host, and we have no way to contain them.

## Missing features

TBD
