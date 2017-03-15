# Raptor Libraries

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

At this point, any component definition and any other library can import `"ns:foo"` module identifier, e.g.:

```js
import { x, y } from "ns:foo";
import { Element } from "raptor";

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
