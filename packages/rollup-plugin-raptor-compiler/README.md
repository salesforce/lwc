# rollup-plugin-raptor-compiler

Compile Raptor components

## Installation

```bash
npm install --save-dev rollup-plugin-raptor-compiler
```

## Usage

```js
module.exports = {
    entry: 'src/main.js',
    dest: 'dist/app.js',
    format: 'iife',
    plugins: [
        raptorCompiler({
            // By default, component namespace is set to `x`. You can also
            // ovrride the default namespace.
            componentNamespace: 'namespace',

            // Should compiler guess component namespaces based on it path.
            // (default: false)
            mapNamespaceFromPath: true,
        }),
    ]
};
```
