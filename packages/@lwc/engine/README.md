# LWC Engine

@lwc/engine is a private package that handles the runtime for LWC. Don't use this package directly; instead, use lwc.

This packgage includes:

-   Synthetic Shadow DOM
-   Diffing Algo
-   Accessibility Polyfill (AOM)
-   Native Shadow DOM support

### Dependencies

`@lwc/engine` does not include any external runtime dependencies. There are a few "dependencies" that we've manually imported, but it should be noted that this code has been heavilty modified and has little resemblance to the original public code.

-   Snabbdom
    -   Our diffing library for DOM nodes.
    -   src/3rdparty/snabbdom
-   Polymer
    -   Shadow DOM polyfills
    -   src/3rdparty/polymer
