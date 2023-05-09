# Wire Service

This code is the implementation of the Lightning Web Component wire service. The wire service enables declarative binding of data providers called _wire adapters_ to a Lightning web component using the `@wire` decorator. It fulfills the goals of the [data service proposal](https://github.com/salesforce/lwc-rfcs/blob/master/text/0000-data-service.md).

## Summary

Wire adapters simply provide data. A wire adapter doesn't know anything about the components that it provides data to.

In a component, declare its data needs by using the `@wire` decorator to connect (or wire) it to a wire adapter. In this example, the component is wired to the `getBook` wire adapter. This declarative technique makes component code easy to read and reason about.

```js
// bookItem.js
import { LightningElement } from 'lwc';

export default class WireExample extends {
    @api bookId;

    @wire(getBook, { id: '$bookId'})
    book;
}
```

Wire adapters are part of LWC's reactivity system. An `@wire` takes the name of a wire adapter and an optional configuration object, which is specific to the wire adapter. You can use a `$` to mark the property of a configuration object as reactive. When a reactive property’s value changes, the wire adapter's `update` method executes with the new value. When the wire adapter provisions new data, the component rerenders if necessary.

```js
// wire-adapter.js
import { bookEndpoint } from './server';

export class getBook {
    connected = false;
    bookId;

    constructor(dataCallback) {
        this.dataCallback = dataCallback;
    }

    connect() {
        this.connected = true;
        this.provideBookWithId(this.bookId);
    }

    disconnect() {
        this.connected = false;
    }

    update(config) {
        if (this.bookId !== config.id) {
            this.bookId = config.id;
            this.provideBookWithId(this.bookId);
        }
    }

    provideBookWithId(id) {
        if (this.connected && this.bookId !== undefined) {
            const book = bookEndpoint.getById(id);

            if (book) {
                this.dataCallback(Object.assign({}, book));
            } else {
                this.dataCallback(null);
            }
        }
    }
}
```

## Syntax

For complete information about syntax, see [lwc.dev/guide/wire_adapter](https://lwc.dev/guide/wire_adapter#wire-adapters).

## Implementation Example

The RCast App is a PWA podcast player written with Lightning Web Components.

https://github.com/pmdartus/rcast
