// Note for testing purposes the signal implementation uses LWC module resolution to simplify things.
// In production the signal will come from a 3rd party library.

import { addTrustedSignal } from 'lwc';

export class Signal {
    subscribers = new Set();

    constructor(initialValue) {
        this._value = initialValue;
        addTrustedSignal(this);
    }

    set value(newValue) {
        this._value = newValue;
        this.notify();
    }

    get value() {
        return this._value;
    }

    subscribe(onUpdate) {
        this.subscribers.add(onUpdate);
        return () => {
            this.subscribers.delete(onUpdate);
        };
    }

    notify() {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }

    getSubscriberCount() {
        return this.subscribers.size;
    }
}
