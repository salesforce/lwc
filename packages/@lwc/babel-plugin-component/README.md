# @lwc/babel-plugin-component

This babel plugin does the following transform:

-   Global decorator transform:
    -   Transform `@api` decorator to `publicProperties` and `publicMethods` static properties.
    -   Transform `@wire` decorator to `wire` static property.
    -   Transform `@track` decorator to `track` static property.
-   LWC component class sugar syntax:
    -   Check for misspelled lifecycle hooks.
    -   Import and inject `render` from a collocated template if a component class doesn't already implement a `render` method.
-   Optimization:
    -   If the compiler inject the default template a component, it will also wire the template style to the component.
