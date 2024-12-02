# Synthetic Shadow Root

## Summary

This is a polyfill for ShadowRoot that was tailor-made for LWC in order to meet the performance goals of the Lightning Platform. This doesn't mean that it cannot be used with any other framework, but we took shortcuts and made compromises that might not align well with other frameworks.

## Compromises

- Default content for `<slot>` elements is always empty.
- `slotchange` is only available directly on the `<slot>` (it doesn't bubble as in the case of the native implementation). This restriction is in place because implementing `slotchange` requires using `MutationObserver` which is expensive at runtime. By only supporting `slotchange` event applied directly on the `<slot>` element, the LWC engine receives a clear signal that the component author is interested in listening to this event. This avoids spending unnecessary CPU time when the `slotchange` event is never consumed.
- If you use `MutationObserver` to watch changes in a DOM tree, disconnect it or you will cause a memory leak. Note that a component can observe mutations only in its own template. It can't observe mutations within the shadow tree of other custom elements.
