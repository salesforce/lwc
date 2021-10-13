# @lwc/engine-core

This package contains the core logic shared by different runtime environments. Examples of this
include the rendering engine and the reactivity mechanism. Since this package only provides
internal APIs for building custom runtimes, it should never be consumed directly in an
application.

Usage of internal APIs are prevented by the compiler and are therefore not documented here.

## Supported APIs

This package supports the following APIs.

### @api

This decorator is used to mark the public fields and the public methods of an LWC component.

```js
import { LightningElement, api } from 'lwc';

class LightningHello extends LightningElement {
    @api
    hello = 'default hello';
}
```

### @track

This decorator should be used on private fields to track object mutations.

```js
import { LightningElement, api, track } from 'lwc';

class LightningHello extends LightningElement {
    @api
    get name() {
        return name.raw;
    }
    set name(value) {
        name.normalized = normalize(value);
    }

    @track
    name = {
        raw: 'Web components ',
        normalized: 'Web Components',
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

### LightningElement

This class should be extended to create an LWC constructor.

```js
import { LightningElement } from 'lwc';

class LightningHello extends LightningElement {
    // component implementation
}
```

## Experimental APIs

Experimental APIs are subject to change, may be removed at any time, and should be used at your
own risk!

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

### setHooks()

This experimental API allows setting overridable hooks with an application specific implementation.

List of overridable hooks:

1. `sanitizeHtmlContent`, see [sanitizeHtmlContent](#sanitizeHtmlContent).

### sanitizeAttribute()

This experimental API enables the sanitization of HTML attribute values by external services.

### sanitizeHtmlContent()

This experimental API enables the sanitization of HTML content by external services. The `lwc:inner-html` binding relies on this hook. This hook must be overridden (see [setHooks](#setHooks) ) as the default implementation is to throw an error.

### unwrap()

This experimental API enables the removal of an object's observable membrane proxy wrapper.
