# Lightning Web Components Libraries

## Status

_Implemented_

## Simple Example

File structure:

```bash
modules/ns/foo/foo.js
```

## Library's Entry Point (foo.js)

```js
export const x = 1;
export function y(value) {
    return value * 2;
}
```

At this point, any component definition and any other library can import `"ns-foo"` module identifier, e.g.:

```js
import { x, y } from "ns-foo";
import { LightningElement } from "lwc";

export default class Foo extends Element {
    someValue = x;
    constructor() {
        super();
    }
    handleValueChange(e) {
        const v = y(e.target.value);
        console.log(v);
    }
}
```

## Folding internal pieces

A library is just an entry point to a module. Which means you can have more files in the same folder, and import those pieces from the entry point, and do all the things you do in a regular javascript module. The compiler will rollup all the pieces into a single bundle with the shape of the entry point module for the library.
