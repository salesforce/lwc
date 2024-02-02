# @lwc/signals

This is an experimental package containing the interface expected for signals.

A key point to note is that when a signal is both bound to an LWC class member variable and used on a template,
the LWC engine will attempt to subscribe a callback to rerender the template.

## Reactivity with Signals

A Signal is an object that holds a value and allows components to react to changes to that value.
It exposes a `.value` property for accessing the current value, and `.subscribe` methods for responding to changes.

```js
import { signal } from 'some/signals';

export default class ExampleComponent extends LightningElement {
    count = signal(0);

    increment() {
        this.count.value++;
    }
}
```

In the template, we can bind directly to the `.value` property:

```html
<template>
    <button onclick="{increment}">Increment</button>
    <p>{count.value}</p>
</template>
```

## Supported APIs

This package supports the following APIs.

### Signal

This is the shape of the signal that the LWC engine expects.

```js
export type OnUpdate = () => void;
export type Unsubscribe = () => void;

export interface Signal<T> {
    get value(): T;
    subscribe(onUpdate: OnUpdate): Unsubscribe;
}
```

### SignalBaseClass

A base class is provided as a starting point for implementation.

```js
export abstract class SignalBaseClass<T> implements Signal<T> {
    abstract get value(): T;

    private subscribers: Set<OnUpdate> = new Set();

    subscribe(onUpdate: OnUpdate) {
        this.subscribers.add(onUpdate);
        return () => {
            this.subscribers.delete(onUpdate);
        };
    }

    protected notify() {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }
}
```
