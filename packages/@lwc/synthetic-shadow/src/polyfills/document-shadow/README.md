# document Shadow DOM polyfills

This polyfill contains all the patched methods we need to work with our Synthetic Shadow.

`document.elementFromPoint`: makes elementFromPoint aware of our synthetic shadow roots.

-   Polyfill will only return root nodes from LWC trees
-   Polyfill works correctly in both Synthetic and Native Shadow Dom modes

`document.activeElement`: makes activeElement aware of our synthetic shadow roots.

-   Polyfill will only return root nodes from LWC trees
-   Polyfill works correctly in both Synthetic and Native Shadow Dom modes
