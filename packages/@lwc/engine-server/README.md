# @lwc/engine-server

WARNING: This is an experimental package. It is subject to change, may be removed at any time,
and should be used at your own risk!

This package can be used to render LWC components as strings in a server environment.

## Supported APIs

This package supports the following APIs.

### renderComponent()

This function renders a string-representation of a serialized component tree, given a tag name
and an LWC constructor. The output format itself is aligned with the [current leading
proposal][explainer], but is subject to change. The result is a pair {html,styles} with
html being the markup, whyle styles is undefined.

It also supports synthetic-shadow by generating the proper Light DOM markup. In this case, the result
returns an array of inline styles to be injected in the parent, typically the head of the document.

```js
import { renderComponent } from 'lwc';
import LightningHello from 'lightning/hello';

const componentProps = {};
const { html, styles } = renderComponent('lightning-hello', LightningHello, componentProps, {
    syntheticShadow: true,
});
```

[explainer]: https://github.com/mfreed7/declarative-shadow-dom/blob/master/README.md
