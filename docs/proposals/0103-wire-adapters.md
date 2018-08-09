# RFC: Wire Adapters

## Status

- Start Date: 2018-02-06
- RFC PR: https://github.com/salesforce/lwc/pull/74

## Summary

The [data service](/docs/proposals/data-service.md) defines two categories of invariants: _Fundamental_ and _Component Integration_. Imperative access for DML and non-DML operations is assumed. Using the callable's identity as the identifier of the wire adapter (the pluggable mechanism of the data service) is assumed.

This RFC defines a protocol for wire adapters so new wire adapters may be authored and consumed by components without coordination of the framework.

## Basic example

A component demonstrating consumption of the `todo` wire adapter and then requesting a refresh of the data stream.

```js
import { LightningElement, wire } from 'lwc';
import { getTodo, refreshTodo } from 'todo-wire-adapter';
export default class TodoViewer extends LightningElement {
    @api id;

    // Wire identifier is the imported callable getTodo
    @wire(getTodo, { id: '$id' })
    wiredTodo;

    imperativeExample() {
        getTodo({id: 1})
            .then(todo => { ... });
    }

    refreshExample() {
        this.showSpinner(true);
        // Request refresh using the value emitted from the wire.
        refreshTodo(this.wiredTodo)
            .then(() => this.showSpinner(false));
    }
}
```

An implementation of the `todo` wire adapter that uses observables for a stream of values.

```js
import { register, ValueChangedEvent } from 'wire-service';

// Imperative access.
export function getTodo(config) {
    return getObservable(config)
        .map(makeReadOnlyMembrane)
        .toPromise();
}

// Declarative access: register a wire adapter factory for  @wire(getTodo).
register(getTodo, function getTodoWireAdapterFactory(eventTarget) {
    let subscription;
    let config;

    // Invoked when config is updated.
    eventTarget.addListener('config', (newConfig) => {
        // Capture config for use during subscription.
        config = newConfig;
    });

    // Invoked when component connected.
    eventTarget.addListener('connected', () => {
        // Subscribe to stream.
        subscription = getObservable(config)
            .map(makeReadOnlyMembrane)
            .map(captureWiredValueToConfig.bind(config))
            .subscribe({
                next: (data) => wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data, error: undefined })),
                error: (error) => wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error }))
            });
    })

        // Invoked when component disconnected.
    eventTarget.addListener('disconnected', () => {
        // Release all resources.
        subscription.unsubscribe();
        releaseConfig(config);
    });
});

// Component-importable refresh capability. Returns Promise<any> that
// resolves when all wires are updated.
export function refreshTodo(wiredValue) {
    return getConfig(wiredValue).map(getTodo);
}
```

## Motivation

The [data service](/docs/proposals/data-service.md) defines a declarative mechanism for a component to express its data requirements: the `@wire` decorator. Imperative access (discussed elsewhere) enables components to orchestrate control flow which is generally required for DML operations.

The protocol for wire adapters is not formalized so new adapters require coordination with the framework and knowledge of the wire service implementation.

Supporting refresh of values emitted by the wire service (wired values) is not possible because wire adapters can't associate the wired value and the originating wire adapter configuration.

## Goals of this proposal

- Enable non-framework developers to define new wire adapters
- Enable wire adapters to implement imperative refresh capabilities that operate on the wired value
- Maintain the easy-to-use declarative `@wire` decorator
- Maintain the ability to initiate data fetch at component creation
- Maintain a component's ability to orchestrate control flow, specifically for DML operations

## Proposal

A _wire adapter_ provisions data to a wired property or method using an [Event Target](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget). A factory function is registered for declarative `@wire` use by a component.

```js
// Events the wire adapter can dispatch to provision a value to the wired property or method
interface ValueChangedEvent {
    value: any;
    new(value: any) : ValueChangedEvent;
}

// Event types the wire adapter may listen for
type eventType = 'config' | 'connect' | 'disconnect';

interface ConfigListenerArgument {
    [key: string]: any;
}
type Listener = (config?: ConfigListenerArgument) => void;

interface WireEventTarget extends EventTarget {
    dispatchEvent(event: ValueChangedEvent): boolean;
    addEventListener(type: eventType, listener: Listener): void;
    removeEventListener(type: eventType, listener: Listener): void;
}

// Registers a wire adapter factory for an imperative accessor
register(adapterId: Function|Symbol, wireAdapterFactory: (eventTarget: WireEventTarget) => void): undefined;
```

In the component's `wiring` lifecycle, the wire service invokes the `wireAdapterFactory` function to configure an instance of the wire adapter for each `@wire` instance (which is per component instance).

`eventTarget` is an implementation of [Event Target](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) that supports listeners for the following events:
- `config` is delivered when the resolved configuration changes. A singular argument is provided: the resolved configuration.
- `connect` is delivered when the component is connected.
- `disconnect` is delivered when the component is disconnected.

The wire service remains responsible for resolving the configuration object. `eventTarget` delivers a `config` event when the resolved configuration changes. The value of the configuration is specific to the wire adapter. The wire adapter must treat the object as immutable.

The wire adapter is responsible for provisioning values by dispatching a `ValueChangedEvent` to the event target. `ValueChangedEvent`'s constructor accepts a single argument: the value to provision. There is no limitation to the shape or contents of the value to provision. The event target handles property assignment or method invocation based on the target of the `@wire`.

The wire adapter is responsible for maintaining any context it requires. For example, tracking the values it provisions and the originating resolved configuration is shown in the basic example.

### Imperative

Imperative access to data is unchanged. The wire adapter module must export a callable. The callable's arguments should (not must) match those of the wire adapter's configuration. The return value is adapter specific; it need not be a promise.

### Refresh

Wire adapters may optionally implement a refresh mechanism by defining an importable callable with the signature below. The function receives one argument: the wired value emitted by a `@wire`.

```js
type refresh: (wiredValue: any) => promise<any>
```

The callable receives one argument, `wiredValue`, which is the value emitted from the wire adapter (the parameter to the `ValueChangedEvent` constructor).

The callable must return a `promise<any>` that resolves after the corresponding `@wire` is updated (assuming it updates). The value resolved is adapter specific.

### Advantages

- Event listening and dispatching is a well-understood pattern. EventTarget is a well-understood interface of this pattern.
- The wire adapter has control of the shape of value it provisions.
- The wire adapter has control over how it emits read-only values, enabling optimizations specific to the adapter.
- `eventTarget` unifies emitting values to wired properties or wired methods. The wire adapter need not handle this.
- Symmetry of using `@wire` and requesting a refresh creates an easy-to-use API.
- Caching behavior remains controlled by and private to the wire adapter.
- Access to the wire adapter factory (the callable registered with the wire service) remains private. It is not importable by components.
- Wire adapters can be registered at any time (not just at application boot). This enables fetching wire adapters only when they are required by a module.
- It provides a path for additional "context" (eg the host element) to be provided to the wire adapter. See _Extended Proposal_.

### Disadvantages

- Wire adapters may emit complex types that are challenging to use. For example, emitting observables requires significant expertise of the component author. The Angular2+ community's struggle with learning RxJS demonstrates this risk.
- The complexity of a wire adapter is increased from what it is today.
  - This can be mitigated with factory functions that minimize boilerplate code.
  - If refresh is not supported then the wire adapter code is even simpler.
- Other processes are required to ensure uniformity among similar adapters (eg those provided by a single vendor like Salesforce). The shape and semantics of data and error, arguments, etc should be consistent to provide an easy-to-use API.
- Wire adapters require registration to support the declarative `@wire` syntax.
  - Adapter registration can happen after application boot by importing `register` from `wire-service`.
  - Non-registered wire adapters could still function with `@wire(getType)` if the wire service uses `getType` for a one-time resolution.
- Refreshing a wired method requires capturing the wired value. This burden is considered acceptable because it's little code and wiring methods is an advanced use case.

## Extended Proposal

There are known use cases where adapters will use DOM Events to retrieve data from the DOM hierarchy. This is not possible because wire adapters are not provided access to the host element as an EventTarget. This section proposes a solution: the EventTarget provided to the wire adapter factory bridges dispatched events to the host element.

### Extended basic example

The component code changes slightly.

```js
import { LightningElement, wire } from 'lwc';
import { getTodo, refreshTodo } from 'todo-wire-adapter';
export default class TodoViewer extends LightningElement {
    @api id;

    @wire(getTodo, { id: '$id' })
    wiredTodo;

    imperativeExample() {
        // Difference: pass this
        getTodo(this, {id: 1})
            .then(todo => { ... });
    }

    refreshExample() {
        this.showSpinner(true);
        refreshTodo(this.wiredTodo)
            .then(() => this.showSpinner(false));
    }
}
```

This implementation of the `todo` wire adapter uses DOM Events to retrieve the data from a parent element.

```js
import { register, ValueChangedEvent } from 'wire-service';

// Difference: receive an eventTarget, use DOM Events to fetch the observable
function getObservable(eventTarget, config) {
    let observable;
    const event = new CustomEvent('getTodo', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
            config,
            callback: o => { observable = o; }
        }
    });
    eventTarget.dispatchEvent(event);
    return observable;
}

// Wire adapter id isn't a callable because it doesn't support imperative invocation
export const getTodo = Symbol('getTodo');

register(getTodo, function getTodoWireAdapterFactory(eventTarget) {
    let subscription;
    let config;

    eventTarget.addListener('config', (newConfig) => {
        config = newConfig;
    });

    eventTarget.addListener('connected', () => {
        // Difference: pass eventTarget
        subscription = getObservable(eventTarget, config)
            .map(makeReadOnlyMembrane)
            // Difference: capture eventTarget
            .map(captureWiredValueToEventTargetAndConfig.bind(eventTarget, config))
            .subscribe({
                next: (data) => wiredEventTarget.dispatchEvent(new ValueChangedEvent(data)),
                error: (error) => wiredEventTarget.dispatchEvent(new ValueChangedEvent(error))
            });
    })

    eventTarget.addListener('disconnected', () => {
        subscription.unsubscribe();
        // Difference: release eventTarget
        releaseEventTargetAndConfig(config);
    });
});

export function refreshTodo(wiredValue) {
    // Difference: retrieve eventTarget and config
    return getEventTargetAndConfig(wiredValue).map(getTodo);
}
```

The scope of changes is minimal: the event target re-dispatches events other than `ValueChangedEvent` to the host element.

## Rejected Proposals

### Proposal 1: Promise-based

Writing a new wire adapter should be as easy as implementing a module that exports a callback with a simple protocol:

```js
export function getFoo(config) {
    // return `Promise<foo>`
}
```

- The adapter must be a callable that expects exactly one argument.
- The argument provided to the adapter is the resolved configuration. Its type is object; the keys and values are type any.
- The result of calling the adapter must be a Promise that resolves to the data type serviced by the adapter.

#### Advantages

- Wire adapter does not require registration.
- Caching behavior remains in control of and private to the wire adapter.
- API of `@wire` and imperative access is unchanged from a component perspective.
- Component can invoke the callable the same as `@wire` does.
- Promises are a well-known protocol, minimal learning curve.

#### Disadvantages

- Wire adapter can't return non-promise values.
- No way for the wire adapter to update the data it returned in the promise. Wire adapter can return a new promise only when the configuration changes.

### Proposal 2: Observables-based

This proposal is similar to Proposal 1 except that it uses [observable](https://github.com/tc39/proposal-observable) instead of promises. Note: this proposal does not specify the observable protocol, that can be specified somewhere else.

Writing a new wire adapter should be as easy as implementing a module that exports a callback with a well defined protocol for observables:

```js
export function getFoo(config) {
    // return an observable that emits `foo`
}
```

- The adapter must be a callable that expects exactly one argument.
- The argument provided to the adapter is the resolved configuration. Its type is object; the keys and values are type any.
- The result of calling the adapter must be an observable.

#### Advantages

- Wire adapter does not require registration.
- Caching behavior remains in control of and private to the wire adapter.
- Component can invoke the callable the same as `@wire` does.
- Component authors have access to observables, which are a powerful construct.

#### Disadvantages

- Observables are not a natural fit for DML operations.
- Requiring component authors to be experts in observables increases the learning curve drastically. As a reference, the Angular2 community's struggle with learning RxJS.
- Observables are a [stage 1](https://github.com/tc39/proposals) spec and undergoing significant churn. LWC guarantees backwards compatibility so the wire service and/or adapters take on that responsibility.
- Leaking subscriptions and async functional issues is a foot gun. We'd need to solve this.
- No clear path to give the wire adapter access to the component instance or other contextual data.

### Proposal 3: Thenable observable

This proposal is similar to Proposal 2 except that it combines observable and thenable structures into a single object.

The adapter must return a thenable that might or might not implement the observable protocol. This means that imperative calls to that adapter will return something that is compatible with the promise protocol, which is easy to use, while the `@wire` decorator and advanced users can rely on the observable protocol to get a stream of data.

This variation of proposal 2 addresses several disadvantages by enabling usage of the standard promise protocol.

This variation introduces two main problems:

- Combining thenable with observable is itself new and confusing.
- By exposing a non-standard observable protocol to the end-user, we open the door for potential problems in the future.

### Proposal 4: Public thenable and private observable

This proposal is a combination of proposals 1 and 2:

- Imperative invocation returns a promise.
- `@wire` invocation returns an observable.

Rationale for the imperative behavior:

- Users are _much_ more familiar with promises than observables. The former is part of the language. Requiring expertise in observables increases the learning curve drastically. As a reference, look at the Angular2 community's struggle with learning RxJS.
- Observables are easy to create leaks and functional issues. Eg subscribe to an observable, next() handler updates component state, and then the component is destroyed. The subscription is leaked (only possible to unsubscribe with the return value from subscribe). Subsequent invocation of the next() handler will throw (or be useless) due to the component being destroyed. This is a foot gun.
- A promise is a better fit for DML operations which requires imperative invocation so the component manages control flow.

Rationale for `@wire` behavior:

- @wire is limited to read operations; specifically, read operations that are memoizable (idempotent, side-effect free, etc). This is because using `@wire` transfers data loading control flow to the system. The system will provision the data to the component it on its timeframe. The invariant is that it happens after component constructor and prop setting.
- `@wire` avoids leaks and "destroyed component" errors by hooking the lifecycle of the component. This is possible because `@wire` runs in "privileged space" via the wiring lifecycle hook.

The wire adapter:

- Must expose an API that returns promises for userland imperative invocation
- Must expose an API that returns an observable for `@wire` invocation
- Ensure consistency of data across those invocation paradigms.
- Maintains control of caching. The implementation of this is private to the wire adapter.
- Is highly recommended to use multi-cast observables and other techniques to minimize memory consumption and runtime.
- Is recommended to provide a cache invalidation mechanism, provided as an imperative JS API that's invocable from userland.

#### Addressing issues from proposal 3

- The API that returns an observable doesn't have to be exposed to components; instead it can be registered, maybe via `wire.registerAdapter(publicPromiseBaseAPI, privateObservableBaseAPI)` in the module that defines both functions, which guarantees that users will access the `publicPromiseBaseAPI`, and that's what they will provide as the identify of the adapter via the `@wire` decorator, while the internals of the `@wire` decorator can invoke `privateObservableBaseAPI` instead to obtain access to the observable.

### Proposal 5: callbacks

This proposal differs from the primary proposal only in the ergonomics exposed to the wire adapter developer:
- To provision values, the wire adapter receives a function instead of an event [Event Target](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget).
- To observe changes to the resolved configuration and component lifecycle, the wire adapter factory returns an object with several callback functions instead of listening to events from the Event Target.

```js
register(getType, function wireAdapter(targetSetter) {
    return {
        updatedCallback: (config) => {
        },
        connectedCallback: () => {
        },
        disconnectedCallback: () => {
        }
    };
});
```

#### Disadvantages

- Multiple patterns (function callbacks, event emitting) must be implemented in the wire adapter.
- A wire adapter is unable to unregister from callbacks. That is, by providing a `connectedCallback` function the wire adapter will always receive notification of component connected.
