# LWC Compiler

@lwc/compiler is an open source project that enables developers to take full control of processing a single Lightning Web Components module for runtime consumption.

## Installation

```sh
yarn add --dev @lwc/compiler
```

## APIs

### `transform`

Transform the content of individual file.

```js
import { transform } from '@lwc/compiler';

const source = `
    import { LightningElement } from 'lwc';
    export default class App extends LightningElement {}
`;

const filename = 'app.js';

const options = {
    namespace: 'c',
    name: 'app',
};

const { code } = await transform(source, filename, options);
```

**Parameters:**

-   `source` (string, required) - the source to be transformed can be the content of javascript, HTML, CSS.
-   `filename` (string, required) - the source filename with extension.
-   `options` (object, required) - the transformation options. The `name` and the `namespace` of the component is a minimum required for transformation.

**Return**

-   `code` (string) - the compiled source code.
-   `map` (object) - the generated source map.

### `version`

```js
import { version } from '@lwc/compiler';

console.log(version);
```

**Return**

-   `version` (string) - the current version of the compiler ex: `0.25.1`.
