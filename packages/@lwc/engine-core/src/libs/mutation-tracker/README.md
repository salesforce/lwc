# Mutation Tracker Library

The Object Mutation Tracker Library is one of the foundational piece for Lightning Web Components.

## Use Cases

One of the prime use-cases for mutation tracking is the popular `@observed` or `@tracked` decorator used in components to detect mutations on the state of the component to re-render the component when needed. In this case, any decorated field descriptor can be replaced with a getter where we track access to the field value, and a setter where we track mutation to the field value. By providing such notifications, we can observe access to fields, and mutations to fields, to take action.

This library implements all the different pieces to achieve such mutation tracking mechanism. In general, any piece of code can notify about property value access on objects, and property value mutation on objects, and it doing so, their are passive participants of a much larger reactive layer.

Additionally, you can create a `ReactiveObserver` object, which allows you to track the execution of a set of instructions (a function call), during that execution, any tracked property will automatically become active, and a notification will be issued when any of those tracked properties are mutated in the future. When you wish to not longer track those mutations for a `ReactiveObserver` instance, you can reset its tracked records.

## Usage

The following example illustrates how to create a `ReactiveObserver` instance:

```js
import { ReactiveObserver } from '../libs/mutation-tracker';
const ro = new ReactiveObserver(() => {
    // this callback will be called when tracked property `x` of `o`
    // is mutated via `valueMutated` in the future.
});
ro.observe(() => {
    // every time observe() is invoked, the callback will be immediately
    // called, and any observed value will be recorded and linked to this
    // ReactiveObserver instance, in case a mutation happens in the future.
    valueObserved(o, 'x');
});
```

While passive participants should be able to notify when any access and mutation occur by using `valueObserved()` and `valueMutated()` functions. E.g.:

```js
elm.addEventListener('click', () => {
    // incrementing `o.x`
    o.x += 1;
    // record the mutation in case someone is tracking it
    valueMutated(o, 'x');
});
```

Since there is an instance of `ReactiveObserver` observing the PropertyKey `x` of object `o` (look at the job function passed as argument of `ro.observer` method), the callback passed into the constructor of `ro` should be invoked when the mutation is observed.

Note: `valuedObserved` and `valueMutated` can be used anywhere. It is usually used in getter and setters, or in Proxy's traps.

### Resetting a ReactiveObserver tracker

Following the previous example, you can call the `reset()` method on a `ReactiveObserver` instance to unlink any previously linked call to `valueObserved` from the previous call to `observe()` method. E.g.:

```js
ro.reset();
```

Note: this library relies on a `WeakMap` to avoid leaking memory. The call to `reset()` method is not intended to release any memory allocation, it is purely designed to stop observing, so the callback will not be invoked until a new invocation to the `observe()` method is issued.

Note: Instances of `ReactiveObserver` are reusable by design, which means you can call `observe()` method as many times as you want, just keep in mind that any new invocation of such method will reset any previous tracking record in favor of the new ones.

## API

### `new ReactiveObserver(callback)`

Create a new reactive observer instance.

**Parameters**

-   `callback` [function] The callback function to be called once a qualifying mutation notification is received by code calling `valueMutated(...)`.

### `ReactiveObserver.prototype.observe(job)`

Method on a `ReactiveObserver` instance to invoke the job and link any invocation of `valueObserved(...)` to this record.

**Parameters**

-   `job` [function] The function to be immediately invoked to track any invocation of `valueObserved(...)` during the execution of this function.

### `ReactiveObserver.prototype.reset()`

Method on a `ReactiveObserver` instance to unlink any previous recorded `valueObserved` invocation associated to this instance.

### `valueObserved(obj, key)`

Public function from this library that can be used by any function to notify that a key property from an object has been accessed (inspected).

**Parameters**

-   `obj` [Object] Any javascript object other than `null`.
-   `key` [PropertyKey] A PropertyKey of the `obj` that was accessed.

### `valueMutated(obj, key)`

Public function from this library that can be used by any function to notify that a mutation of a key from an object has been occurred.

**Parameters**

-   `obj` [Object] Any javascript object other than `null`.
-   `key` [PropertyKey] A PropertyKey of the `obj` that was mutated.
