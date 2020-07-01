# @lwc/engine-dom

This package can be used to render LWC components as DOM elements in a DOM environment.

Usage of internal APIs are prevented by the compiler and are therefore not documented here.

## Supported APIs

This package supports the following APIs.

### createElement()

This function creates an LWC component, given a tag name and an LWC constructor.

```js
import { createElement } from '@lwc/engine-dom';
import LightningHello from 'lightning/hello';

const element = createElement('lightning-hello', { is: LightningHello });

document.body.appendChild(element);
```

## Experimental APIs

Experimental APIs are subject to change or removal, are not stable, and should be used at your
own risk.

### getComponentConstructor()

This experimental API provides access to the component constructor, given an `HTMLElement`.

### isNodeFromTemplate()

This experimental API enables the detection of whether a node was rendered from an LWC template.

## Deprecated APIs

### buildCustomElementConstructor() (deprecated as of v1.3.11)

This function can build a Web Component class that can be registered as a new element via
`customElements.define()`, given an LWC constructor.

Deprecated in favor of using the `CustomElementConstructor` property of an LWC constructor.

```js
import { LightningElement } from '@lwc/engine-dom';

class LightningHello extends LightningElement {}

// Don't do this.
customElements.define('lightning-hello', buildCustomElementConstructor(LightningHello));

// Do this instead.
customElements.define('lightning-hello', LightningHello.CustomElementConstructor);
```
