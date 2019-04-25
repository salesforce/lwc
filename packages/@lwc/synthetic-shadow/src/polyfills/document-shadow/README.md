# document Shadow DOM polyfills

This polyfill contains all the patched methods we need to work with our Synthetic Shadow.

-   Patched methods will only return root node(s) from the LWC trees.
-   Polyfill works correctly in both Synthetic and Native Shadow Dom modes
-   Methods patched:
    -   `document.activeElement`
    -   `document.elementFromPoint`
    -   `Document.prototype.getElementsByClassName`
    -   `Document.prototype.getElementById`
    -   `Document.prototype.getElementsByTagName`
    -   `Document.prototype.getElementsByTagNameNS`
    -   `Document.prototype.getElementsByName`
    -   `Document.prototype.querySelector`
    -   `Document.prototype.querySelectorAll`
