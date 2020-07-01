# @lwc/engine-server

WARNING: This is an experimental package. It is subject to change, may be removed at any time,
and should be used at your own risk!

This package can be used to render LWC components as strings in a server environment.

## Supported APIs

This package supports the following APIs.

### renderComponent()

This function renders a string-representation of a serialized component tree, given a tag name
and an LWC constructor. The output format itself is aligned with the [current leading
proposal][explainer], but is subject to change.

```js
import { renderComponent } from 'lwc';
import LightningHello from 'lightning/hello';

const componentProps = {};
const serialized = renderComponent('lightning-hello', LightningHello, componentProps);
```

[explainer]: https://github.com/mfreed7/declarative-shadow-dom/blob/master/README.md
