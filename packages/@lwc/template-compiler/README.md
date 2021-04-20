# @lwc/template-compiler

Compile LWC HTML template for consumption at runtime.

## Installation

```sh
yarn add --dev @lwc/template-compiler
```

## Usage

```js
import compile from '@lwc/template-compiler';

const options = {};
const { code, warnings } = compile(
    `
    <template>
        <h1>Hello World!</h1>
    </template>
`,
    options
);

for (let warning of warnings) {
    console.log(warning.message);
}

console.log(code);
```

## APIs

### `compile`

Compile a LWC template to javascript source code consumable by the engine.

```js
import compile from '@lwc/template-compiler';
const { code, warnings } = compile(`<template><h1>Hello World!</h1></template>`, {});
```

**Parameters:**

-   `source` (string, required) - the HTML template source to compile.
-   `options` (object, required) - the options to used to compile the HTML template source.

**Options:**

-   `experimentalComputedMemberExpression` (boolean, optional, `false` by default) - set to `true` to enable computed member expression in the template, eg: `{list[0].name}`.
-   `experimentalDynamicDirective` (boolean, optional, `false` by default) - set to `true` to allow useges of `lwc:dynamic` directive in the template.
-   `preserveHtmlComments` (boolean, optional, `false` by default) - set to `true` if you want HTML comments in the template to be preserved in the output.

**Return:**
The method returns an object with the following fields:

-   `code` (string) - the compiled template.
-   `warnings` (array) - the list of warnings produced when compiling the template. Each warning has the following fields:
    -   message (string) - the warning message.
    -   level (string) - the severity of the warning: `info`, `warning`, `error`.
    -   start (number) - the start index in the source code producing the warning.
    -   length (number) - the character length in the source code producing the warning.

### `compileToFunction`

Compile a LWC template to a javascript function. This method is mainly used for testing purposes.

```js
import { LightningElement } from 'lwc';
import { compileToFunction } from '@lwc/template-compiler';

const html = compileToFunction(`<template><h1>Hello World!</h1></template>`);

class Component extends LightningElement {
    render() {
        return html;
    }
}
```

**Parameters:**

-   `source` (string, required) - the HTML template source to compile.

**Return:**
The method returns an evaluated function that can be used directly in a component `render` method.
