# @lwc/engine-server

This package can be used to render LWC components as strings in a server environment.

Usage of internal APIs are prevented by the compiler and are therefore not documented here.

## Supported APIs

This package supports the following APIs.

### renderComponent()

This function renders a string-representation of a serialized component tree, given a tag name
and an LWC constructor. The output format itself is aligned with the [current leading
proposal][explainer], but is subject to change.

### LightningElement

This class should be extended to create an LWC constructor.

```js
import { LightningElement } from '@lwc/engine-dom';

class LightningHello extends LightningElement {
    // component implementation
}
```

### @api

This decorator is used to mark the public fields and the public methods of an LWC component.

```js
import { LightningElement, api } from '@lwc/engine-dom';

class LightningHello extends LightningElement {
    @api
    hello = 'default hello';
}
```

### @track

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

### @wire

This decorator should be used to wire fields and methods to a wire adapter.

```js
import { LightningElement, wire } from 'lwc';
import { getRecord } from 'recordDataService';

export default class Test extends LightningElement {
    @wire(getRecord, { id: 1 })
    recordData;
}
```

### createContextProvider()

This function creates a context provider, given a wire adapter constructor.

## Experimental APIs

Experimental APIs are subject to change or removal, are not stable, and should be used at your
own risk.

### getComponentDef()

This experimental API provides access to internal component metadata.

### isComponentConstructor()

This experimental API enables the identification of LWC constructors.

### readonly()

This experimental API enables the creation of a reactive readonly membrane around any object
value.

### register()

This experimental API enables the registration of 'services' in LWC by exposing hooks into the
component life-cycle.

### sanitizeAttribute()

This experimental API enables the sanitization of attribute values by external services.

### unwrap()

This experimental API enables the removal of an object's observable membrane proxy wrapper.

[explainer]: https://github.com/mfreed7/declarative-shadow-dom/blob/master/README.md
