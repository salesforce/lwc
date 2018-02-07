# RFC: Wire Adapters

## Status

- Start Date: 2018-02-06
- RFC PR: TBD

## Summary

Wire adapters are responsible for providing access to any data that is required by your component, whether it is driven by the external API of the component or by some internal state. New wire adapters are needed to provide new capabilities in terms of data collections. This RFC defines the process to create new wire adapters, their ergonomics and protocols.

## Motivation

The primary use-case for the `@wire()` decorator is to allow access to any data, not just salesforce data, in a data-stream fashion, while using the public or private state of the component as the inputs for the wire adapter specified via this decorator.

The challenge is to be able to define new adapters to expose new capabilities without too much hazard while preserving all existing the invariants.

## Proposals

### Proposal 1: Simple Promise Based Callbacks

* wire adapters must be explicitly imported or declared by the author.
* external customers can define their own wire adapters (ideally no registration is required).

#### Defining a Wire Adapter

Writing a new wire adapter should be as easy as implementing a module that exports a callback with a simple protocol:

```js
export function getFoo(config) {
    // return the `data` structure or a promise
}
```

* The adapter must be a callable that expects exactly one argument.
* The argument provided to the adapter will be the *resolved* value specified as the second argument of the `@wire` decorator. We call this the adapter configuration, and its type could be anything.
* The adapter configuration is part of the public API specified per adapter.
* The result of calling the adapter must be a promise.

#### Consuming a Wire Adapter

Using the adapter should be as easy as just importing the service:

```js
import { getFoo } from "my/fooService";

export default class List extends HTMLElement {
    @wire(getFoo, { id: '$id' }) foo;
}
```

* `foo` property will always be an object with a well defined schema specified by the wire adapter.
* `@wire` decorator is responsible for invoking the adapter (when needed) with the computed configuration. (in this case `'$id'` will be replaced with the value of `this.id` before invoking the adapter).
* the result of calling the adapter must be a promise, and depending on its resolution, `foo.data` and `foo.error` will be allocated accordingly.
* additional details can be added to `this.foo` by expanding the `@wire` decorator protocol (e.g.: "inflight" flag).
* `this.foo` object should always be reactive.
* `this.foo.data` will be read only by the `@wire` decorator protocol.
* `this.foo.data` will be cached by the `@wire` decorator protocol by using the `config` as its key.

#### Pros

* Caching mechanism is still controlled by the platform via the `@wire` decorator.
* Consumers of the wire adapter via `@wire` decorator can rely on a very simple data structure.
* It is possible to consume the adapter directly by just invoking the callable.
* No registration needed for adapters, which means we can simply control the access by using `import` static analysis.
* The promise protocol is well known, standard base.

#### Cons

* A fundamental problem with this proposal is that it does not provide a way for the `@wire` decorator to update the data unless the config changes due to a mutation in the component's instance state or properties.
* Adapter doesn't really have control, it doesn't know the caller, and it can't do much.

### Proposal 2: Observables

This proposal is almost identical to Proposal 1, except that it uses observables instead of promises. Note: this proposal does not specify the observable protocol, that can be specified somewhere else.

* wire adapters must be explicitly imported or declared by the author.
* external customers can define their own wire adapters (ideally no registration is required).

#### Defining a Wire Adapter

Writing a new wire adapter should be as easy as implementing a module that exports a callback with a well defined protocol for observables:

```js
export function getFoo(config) {
    // return an observable
}
```

* The adapter must be a callable that expects exactly one argument.
* The argument provided to the adapter will be the *resolved* value specified as the second argument of the `@wire` decorator. We call this the adapter configuration, and its type could be anything.
* The adapter configuration is part of the public API specified per adapter.
* The result of calling the adapter must be an observable object.

#### Consuming a Wire Adapter

Using the adapter should be as easy as just importing the service:

```js
import { getFoo } from "my/fooService";

export default class List extends HTMLElement {
    @wire(getFoo, { id: '$id' }) foo;
}
```

* `foo` property will always be an object with a well defined schema specified by the wire adapter.
* `@wire` decorator is responsible for invoking the adapter (when needed) with the computed configuration. (in this case `'$id'` will be replaced with the value of `this.id` before invoking the adapter).
* the result of calling the adapter must be an observable, and depending on it, `foo.data` and `foo.error` will be allocated accordingly.
* additional details can be added to `this.foo` by expanding the `@wire` decorator protocol (e.g.: "inflight" flag).
* `this.foo` object should always be reactive.
* `this.foo.data` will be read only by the `@wire` decorator protocol.
* `this.foo.data` will be cached by the `@wire` decorator protocol by using the `config` as its key.

#### Pros

* Caching mechanism is still controlled by the platform via the `@wire` decorator.
* Consumers of the wire adapter via `@wire` decorator can rely on a very simple data structure.
* It is possible to consume the adapter directly by just invoking the callable that returns the observable.
* No registration needed for adapters, which means we can simply control the access by using `import` static analysis.
* The `@wire` decorator can subscribe to the observable and rehydrate the component when new data comes available by rely on the observable protocol.

#### Cons

* Adapter doesn't really have control, it doesn't know the caller, and it can't do much.
* The observable protocol is not as trivial as the promise protocol, nor it is standard.

#### Open Questions

* should the config object be a simple `Record<string, string | number>`, or could it be a complex/multilevel object?
* should `this.foo.data` be "reactive" only if the adapter choose to? or should it always be reactive?
* should `this.foo.data` be "read only" only if the adapter choose to? or should it always be read only?
