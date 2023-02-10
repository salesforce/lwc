# @lwc/features

Runtime flags can be enabled or disabled by setting a boolean value for that
flag in `globalThis.lwcRuntimeFlags`, e.g.:

```js
lwcRuntimeFlags.ENABLE_SOME_FEATURE = true;
```

If the flag is not explicitly
set, the feature is disabled by default. The `lwcRuntimeFlags` object
must appear before the engine is initialized and should be defined at the
application layer.

Internally, LWC will reference runtime flags like so:

```js
if (lwcRuntimeFlags.ENABLE_SOME_FEATURE) {
    // etc.
}
```

This makes it possible for consumers to replace these flags at compile time, using something like [Rollup's `@rollup/plugin-replace`](https://www.npmjs.com/package/@rollup/plugin-replace) or [ESBuild's `define`](https://esbuild.github.io/api/#define).

Note that `@lwc/features` is an internal package used by LWC and (most likely) should not be directly used by consumers.
