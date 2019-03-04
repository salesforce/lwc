# lwc-jest-resolver

The default [Jest](https://facebook.github.io/jest/) resolver for finding lwc-\* modules. This project leverages [lwc-npm-resolver](https://git.soma.salesforce.com/raptor/raptor/tree/master/packages/lwc-npm-resolver) to allow LWC components to import modules by their shorthand. For example, lwc-engine can be imported simply as `engine`.

For more info on resolvers see the Jest [doc](https://facebook.github.io/jest/docs/configuration.html#resolver-string).

## Requirements

-   Node 8.x
-   NPM 5.x
-   Yarn >= 1.0.0
-   Jest >= 21.x

## Usage

This resolver will be included as part of LWCs preset Jest configuration. Follow directions on the official [doc](http://raptor.sfdc.es/guide/testing.html#Configuration) to use the presets. For example:

```json
{
    "jest": {
        "preset": "lwc-jest-preset"
    }
}
```

Alternatively, you can directly set the resolver in your config. For example:

```json
{
    "jest": {
        "resolver": "lwc-jest-resolver"
    }
}
```

If you are writing your own custom resolver, you can point Jest to your resolver and then delegate to this resolver directly, which in turn delegates to the Jest default resolver.
