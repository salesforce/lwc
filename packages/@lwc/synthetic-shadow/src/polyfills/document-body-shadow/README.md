# document.body Shadow DOM polyfills

This polyfill contains all the patched methods for document.body to work with our Synthetic Shadow.

-   Patched methods will only return root node(s) from the LWC trees.
-   Polyfill works correctly in both Synthetic and Native Shadow Dom modes
-   Methods patched:
    -   `document.body.querySelector`
    -   `document.body.querySelectorAll`
    -   `document.body.getElementsByClassName`
    -   `document.body.getElementsByTagName`
    -   `document.body.getElementsByTagNameNS`
