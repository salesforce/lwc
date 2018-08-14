# Wire Service

This is the implementation of Lightning Web Component's wire service. It enables declarative binding of services to a LWC component using the `@wire` decorator. It fulfills the goals of the [data service proposal](/docs/proposals/data-service.md).

## Summary

The `@wire` decorator provides LWC components with a declarative mechanism to express their data requirements. Imperative access (eg for DML) is not part of the wire service. A summary of the wire service follows:

* Loading data is expressed declaratively by a component using `@wire([adapterId], [adapterConfig])`
  * `[adapterId]` refers to the identity of a wire adapter.
  * `[adapterConfig]` is an optional parameter, of type object, that defines wire adapter-specific configuration.
  * `[adapterConfig]` may contain static values or reactive references.
  * A reactive reference is identified with a `$` prefix. The remainder of the string identifies a class property. A change to a referenced class property causes new data to be requested from the wire adapter.
* The wire service delegates to `wire adapters` to source, manage, and provision data. The wire service sits between wire adapters and LWC components.
* It's all data from the wire service's perspective. Nothing is metadata.
* It is assumed all data mutates over time yet a given snapshot of data is immutable.
* A component receiving data does not own that data. It is comparable to a component receiving props does not own the props.

## Example

Consider a component that wants to display the details of a todo item.

```js
import { LightningElement, api, wire } from 'lwc';
import { getTodo } from 'todo-api';
export default class TodoViewer extends LightningElement {
    @api id;
    @wire(getTodo, { id: '$id' })
    todo
}
```

## Wire Adapter Specification

A `wire adapter` provisions data to a wired property or method using an [Event Target](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget). A factory function is registered for declarative `@wire` use by a component.

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


## Build & run the playground

For your development convenience, you can build the playground files and launch a Node server:

```bash
yarn start
```

Load the examples in a browser:

```bash
open http://localhost:3000/
```
