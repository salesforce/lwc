# document.elementFromPoint polyfill

This polyfill is needed to make `document.elementFromPoint` aware of our synthetic shadow roots.

- Polyfill will only return root nodes from LWC trees
- Polyfill works correctly in both Synthetic and Native Shadow Dom modes
