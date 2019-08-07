### TODO

-   move fallback to be a global setting (eventually remove it)
-   move NodeKey generation to the shadowRoot instantiation
-   refactor detection of upgrade.ts to not use NodeKey, instance use the instanceOf patched per constructor
-   move the caching mechanism of the patched bridge into the proper place in engine
-   PatchedCustomElement should be issued by the attachShadow invocation
-   move shadowAttribute to the attachShadow invocation (must be cached by synthetic shadow), e.g.: `attachShadow({mode: 'open', syntheticShadowToken: 'f00_bar'})` which should be the main communication layer between engine and synthetic.
-   remove CreateVMInit.owner from engine (this has concequences on the error boundary)
-   remove CreateVMInit.isRoot from engine, and all checks on isRoot (this depends on the reactive setters PR which removes the only relevant check for isRoot)

Others:

-   implement globalThis polyfill
