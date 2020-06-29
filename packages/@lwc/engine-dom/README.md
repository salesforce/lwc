# @lwc/engine-dom

This package can be used to render LWC components as DOM elements in a DOM environment.

Usage of internal APIs are prevented by the compiler and are therefore not documented here.

## Supported APIs

This package supports the following APIs.

### createElement

This function creates an LWC component, given a tag name and an LWC constructor.

```js
import { createElement } from '@lwc/engine-dom';
import LightningHello from 'lightning/hello';

const element = createElement('lightning-hello', { is: LightningHello });

document.body.appendChild(element);
```

### LightningElement

This class should be extended to create an LWC constructor.

```js
import { LightningElement } from '@lwc/engine-dom';

class LightningHello extends LightningElement {
    // component implementation
}
```

### api

This decorator is used to mark the public fields and the public methods of an LWC component.

```js
import { LightningElement, api } from '@lwc/engine-dom';

class LightningHello extends LightningElement {
    @api
    hello = 'default hello';
}
```

### track

This decorator should be used on private fields to track object mutations.

```js
import { LightningElement, api, track } from '@lwc/engine-dom';

class LightningHello extends LightningElement {
    @api
    get name() {
        return name.raw;
    }
    set name(value) {
        name.normalized = value.trim().toLowerCase();
    }

    @track
    name = {
        raw: 'Web Components',
        normalized: 'web components',
    };
}
```

### wire

This decorator should be used to wire fields and methods to a wire adapter.

```js
import { LightningElement, wire } from 'lwc';
import { getRecord } from 'recordDataService';

export default class Test extends LightningElement {
    @wire(getRecord, { id: 1 })
    recordData;
}
```

### createContextProvider

This function creates a context provider, given a wire adapter constructor.

## Experimental APIs

Experimental APIs are subject to change or removal, are not stable, and should be used at your own risk.

### getComponentConstructor

This experimental API provides access to the component constructor, given an `HTMLElement`.

### getComponentDef

This experimental API provides access to internal component metadata.

### isComponentConstructor

This experimental API enables the identification of LWC constructors.

### isNodeFromTemplate

This experimental API enables the detection of whether a node was rendered from an LWC template.

### readonly

This experimental API enables the creation of a reactive readonly membrane around any object value.

### register

This experimental API enables the registration of 'services' in LWC by exposing hooks into the component life-cycle.

### sanitizeAttribute

This experimental API enables the sanitization of attribute values by external services.

### unwrap

This experimental API enables the removal of an object's observable membrane proxy wrapper.

## Deprecated APIs

### buildCustomElementConstructor (deprecated as of v1.3.11)

Deprecated in favor of using the `CustomElementConstructor` property of an LWC constructor.

This deprecated function can build a Web Component class that can be registered as a new element via `customElements.define()`, given an LWC constructor.

```js
import { LightningElement } from '@lwc/engine-dom';

class LightningHello extends LightningElement {}

// Don't do this.
customElements.define('lightning-hello', buildCustomElementConstructor(LightningHello));

// Do this instead.
customElements.define('lightning-hello', LightningHello.CustomElementConstructor);
```
