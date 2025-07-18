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

### setTrustedSignalSet()

This experimental API enables the addition of a signal as a trusted signal. If the [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature is enabled, any signal value change will trigger a re-render.

If `setTrustedSignalSet` is called more than once, it will throw an error. If it is never called, then no trusted signal validation will be performed. The same `setTrustedSignalSet` API must be called on both `@lwc/engine-dom` and `@lwc/signals`.

### isTrustedSignal()

Not intended for external use. This experimental API enables the caller to determine if an object is a trusted signal. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.

### setContextKeys

Not intended for external use. Enables another library to establish contextful relationships via the LWC component tree. The `connectContext` and `disconnectContext` symbols that are provided are later used to identify methods that facilitate the establishment and dissolution of these contextful relationships. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.

### setTrustedContextSet()

Not intended for external use. This experimental API enables the addition of context as trusted context. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.

If `setTrustedContextSet` is called more than once, it will throw an error. If it is never called, then context will not be connected.

### ContextBinding

The context object's `connectContext` and `disconnectContext` methods are called with this object when contextful components are connected and disconnected. The ContextBinding exposes `provideContext` and `consumeContext`,
enabling the provision/consumption of a contextful Signal of a specified variety for the associated component. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.

### SignalBaseClass

Not intended for external use. Signals that extend SignalBaseClass will be added to set of trusted signals. The [ENABLE_EXPERIMENTAL_SIGNALS](https://github.com/salesforce/lwc/blob/master/packages/%40lwc/features/README.md#lwcfeatures) feature must be enabled.
