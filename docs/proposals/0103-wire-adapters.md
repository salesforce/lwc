# RFC: Wire Adapters

## Status

- Start Date: 2018-02-06
- RFC PR: https://github.com/salesforce/lwc/pull/74

## Summary

Wire adapters are responsible for providing access to any data that is required by your component, whether it is driven by the external API of the component or by some internal state. New wire adapters are needed to provide new capabilities in terms of data collections. This RFC defines the process to create new wire adapters, their ergonomics and protocols.

## Motivation

The primary use-case for the `@wire()` decorator is to allow access to any data, not just salesforce data, in a data-stream fashion, while using the public or private state of the component as the inputs for the wire adapter specified via this decorator.

The challenge is to be able to define new adapters to expose new capabilities without too much hazard while preserving all existing the invariants.

## Proposals

### Proposal 1: Simple Promise Based Callbacks (withdraw)

__NOTE: THIS PROPOSAL WAS WITHDRAW DUE TO THE LIMITATIONS THAT IT IMPOSES__

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
* The argument provided to the adapter will be the *resolved* value specified as the second argument of the `@wire` decorator. We call this the adapter configuration, and its type is object while its shape could be anything.
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
* `this.foo.data` will be written only by the `@wire` decorator protocol.
* `this.foo.data` "can" be cached by the `@wire` decorator protocol by using the `config` as its key.

#### Pros

* Caching mechanism is still controlled by the platform via the `@wire` decorator.
* Consumers of the wire adapter via `@wire` decorator can rely on a very simple data structure.
* It is possible to consume the adapter directly by just invoking the callable that returns the observable.
* No registration needed for adapters, which means we can simply control the access by using `import` static analysis.
* The `@wire` decorator can subscribe to the observable and rehydrate the component when new data comes available by rely on the observable protocol.

#### Cons

1. Adapter doesn't really have control, it doesn't know the caller, and it can't do much.
2. The observable protocol is not as trivial as the promise protocol, nor it is standard.

#### Open Questions

* should the config object be a simple `Record<string, string | number>`, or could it be a complex/multilevel object?
* should `this.foo.data` be "reactive" only if the adapter choose to? or should it always be reactive?
* should `this.foo.data` be "read-only" only if the adapter choose to? or should it always be read-only?
* should `this.foo.data` be cached by the `@wire` decorator?

### Proposal 3: Thenable Observable

This proposal is almost identical to Proposal 2, except that it combines observable and thenable structures into a single object.

The adapter must return a thenable that might or might not implement the observable protocol. This means that imperative calls to that adapter will return something that is compatible with the promise protocol, and it is really easy to use, while the `@wire` decorator, and advanced users can rely on the observable protocol to get a stream of data.

This variation of proposal 2 addresses the second "cons" partially, by enabling the usage of the standard promise protocol.

This variation introduces two main problems:

1. Combining thenable with observable is itself new and confusing.
2. By exposing a non-standard observable protocol to the end-user, we open the door for potential problems in the future.

### Proposal 4: Public Thenable and private Observable

This proposal is a combination of proposals 1 and 2:

* Imperative invocation returns a promise.
* `@wire` invocation returns an observable.

Rationale for the imperative behavior:

1. Users are _much_ more familiar with promises than observables. The former is part of the language. Requiring expertise in observables increases the learning curve drastically. As a reference, look at the Angular2 community's struggle with learning RxJS.
2. Observables are easy to create leaks and functional issues. E.g.: subscribe to an observable, next() handler updates component state, and then the component is destroyed. The subscription is leaked (only possible to unsubscribe with the return value from subscribe). Subsequent invocation of the next() handler will throw (or be useless) due to the component being destroyed. This is a foot gun.
3. A promise better models CUD operations. CUD operations will be imperatively invoked because using `@wire` gives up control flow to the system.

Rationale for `@wire` behavior:

4. @wire is limited to read operations; specifically, read operations that are memoizable (idempotent, side-effect free, etc). This is because using `@wire` transfers data loading control flow to the system. The system will provision the data to the component it on its timeframe. The invariant is that it happens after component constructor and prop setting.
5. `@wire` avoids leaks and "destroyed component" errors by hooking the lifecycle of the component. This is possible because `@wire` runs in "privileged space" via the wiring lifecycle hook.

The wire adapter:

a. Must expose an API that returns promises for userland imperative invocation
b. Must expose an API that returns an observable for @wire invocation
c. Ensure consistency of data across those invocation paradigms.
d. Is highly recommended to perform client-side caching. Caching lifecycle is adapter-specific. Utilities to facilitate caching, particularly consistent behavior across adapters, is unspecified.
e. Is highly recommended to use multi-cast observables and other techniques to minimize memory consumption and runtime.
f. Is recommended to provide a cache invalidation mechanism, provided as an imperative JS API that's invocable from userland.

#### Addressing issues from proposal 3:

* The API that returns an observable doesn't have to be exposed to user-land, instead can be just registered, maybe via `wire.registerAdapter(publicPromiseBaseAPI, privateObservableBaseAPI)` in the module that defines both functions, which guarantees that users will access the `publicPromiseBaseAPI`, and that's what they will provide as the identify of the adapter via the `@wire` decorator, while the internals of the `@wire` decorator can invoke `privateObservableBaseAPI` instead to obtain access to the observable.
