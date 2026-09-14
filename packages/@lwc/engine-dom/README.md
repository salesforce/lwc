# @lwc/engine-dom

This package can be used to render LWC components as DOM elements in a DOM environment.

## Supported APIs

This package supports the following APIs.

### createElement()

This function creates an LWC component, given a tag name and an LWC constructor.

```js
import { createElement } from 'lwc';
import LightningHello from 'lightning/hello';

const element = createElement('lightning-hello', { is: LightningHello });

document.body.appendChild(element);
```

## Experimental APIs

Experimental APIs are subject to change, may be removed at any time, and should be used at your
own risk!

### getComponentConstructor()

This experimental API provides access to the component constructor, given an `HTMLElement`.

### isNodeFromTemplate()

This experimental API enables the detection of whether a node was rendered from an LWC template.


