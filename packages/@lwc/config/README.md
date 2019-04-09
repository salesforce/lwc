# Wire Service

This is the implementation of Lightning Web Component's wire service. It enables declarative binding of services to a LWC component using the `@wire` decorator. It fulfills the goals of the [data service proposal](/docs/proposals/data-service.md).

## Summary

The `@wire` decorator provides LWC components with a declarative mechanism to express their data requirements. Imperative access (eg for DML) is not part of the wire service. A summary of the wire service follows:

-   Loading data is expressed declaratively by a component using `@wire([adapterId], [adapterConfig])`
    -   `[adapterId]` refers to the identity of a wire adapter.
    -   `[adapterConfig]` is an optional parameter, of type object, that defines wire adapter-specific configuration.
    -   `[adapterConfig]` may contain static values or reactive references.
    -   A reactive reference is identified with a `$` prefix. The remainder of the string identifies a class property. A change to a referenced class property causes new data to be requested from the wire adapter.
-   The wire service delegates to `wire adapters` to source, manage, and provision data. The wire service sits between wire adapters and LWC components.
-   It's all data from the wire service's perspective. Nothing is metadata.
-   It is assumed all data mutates over time yet a given snapshot of data is immutable.
-   A component receiving data does not own that data. It is comparable to a component receiving props does not own the props.

## Example Use Of `@wire`

Consider a component that wants to display the details of a todo item. It uses `@wire` to declare its data requirements.

```js
import { LightningElement, api, wire } from 'lwc';

// the wire adapter identifier
import { getTodo } from 'todo-api';

export default class TodoViewer extends LightningElement {
    @api id;

    // declare the need for data. $id creates a reactive property tied to this.id.
    // data is provisioned into this.todo.
    @wire(getTodo, { id: '$id' })
    todo;
}
```

```html
<template>
    <template if:true="{todo}">
        <input type="checkbox" checked="{todo.completed}" /> {todo.title}
    </template>
</template>
```

## Wire Adapter Specification

The following is a summary of the [wire adapter RFC](/docs/proposals/0103-wire-adapters.md).

A `wire adapter` provisions data to a wired property or method using an [Event Target](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget). A factory function is registered for declarative `@wire` use by a component.

```ts
// The identifier for the wire adapter
type WireAdapterId = Function|Symbol;

// The factory function invoked for each @wire in a component. The WireEventTarget
// allows the wire adapter instance to receive configuration data and provision
// new values.
type WireAdapterFactory = (eventTarget: WireEventTarget) => void;

// Event the wire adapter dispatches to provision values to the wired property or method
interface ValueChangedEvent {
    value: any;
    new(value: any) : ValueChangedEvent;
}

// Event types the wire adapter may listen for
type EventType = 'config' | 'connect' | 'disconnect';

// Event listener callback
type Listener = (config?: { [key: string]: any ) => void;

// Target of the @wire
interface WireEventTarget extends EventTarget {
    dispatchEvent(event: ValueChangedEvent): boolean;
    addEventListener(type: EventType, listener: Listener): void;
    removeEventListener(type: EventType, listener: Listener): void;
}
```

In the component's `wiring` lifecycle, the wire service invokes the `wireAdapterFactory` function to configure an instance of the wire adapter for each `@wire` instance (which is per component instance).

`eventTarget` is an implementation of [Event Target](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) that supports listeners for the following events:

-   `config` is delivered when the resolved configuration changes. A singular argument is provided: the resolved configuration.
-   `connect` is delivered when the component is connected.
-   `disconnect` is delivered when the component is disconnected.

The wire service remains responsible for resolving the configuration object. `eventTarget` delivers a `config` event when the resolved configuration changes. The value of the configuration is specific to the wire adapter. The wire adapter must treat the object as immutable.

The wire adapter is responsible for provisioning values by dispatching a `ValueChangedEvent` to the event target. `ValueChangedEvent`'s constructor accepts a single argument: the value to provision. There is no limitation to the shape or contents of the value to provision. The event target handles property assignment or method invocation based on the target of the `@wire`.

The wire adapter is responsible for maintaining any context it requires. For example, tracking the values it provisions and the originating resolved configuration is shown in the basic example below.

### Registering A Wire Adapter

A wire adapter must be registered with the wire service. The `wire-service` module provides a registration function.

```ts
register(adapterId: WireAdapterId, wireAdapterFactory: WireAdapterFactory);
```

## Example Wire Adapter Implementation

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
    eventTarget.addListener('config', newConfig => {
        // Capture config for use during subscription.
        config = newConfig;
    });

    // Invoked when component connected.
    eventTarget.addListener('connected', () => {
        // Subscribe to stream.
        subscription = getObservable(config)
            .map(makeReadOnlyMembrane)
            .subscribe({
                next: data =>
                    wiredEventTarget.dispatchEvent(
                        new ValueChangedEvent({ data, error: undefined })
                    ),
                error: error =>
                    wiredEventTarget.dispatchEvent(
                        new ValueChangedEvent({ data: undefined, error })
                    ),
            });
    });

    // Invoked when component disconnected.
    eventTarget.addListener('disconnected', () => {
        // Release all resources.
        subscription.unsubscribe();
    });
});
```

# Contributing To The Wire Service

## Build & run the playground

A _playground_ of LWC components using @wire is included. They're served from a basic node server and accessible in your browser.

```bash
yarn start
```

Load the examples in a browser:

```bash
open http://localhost:3000/
```
