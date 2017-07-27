# babel-plugin-transform-ratpr-class

This babel plugin does the following transform:
* Global decorator transform:
    * Transform `@api` decorator to `publicPorperties` and `publicMethods` static properties.
    * Transform `@wire` decorator to `wire` static property.
* Raptor component class sugar syntax:
    * Check for misspelled lifecycle hooks.
    * Import and inject `render` from a collocated template if a component class doesn't already implement a `render` method.
* [babel-plugin-transform-class-properties](https://github.com/babel/babel/blob/7.0/packages/babel-plugin-transform-class-properties)
