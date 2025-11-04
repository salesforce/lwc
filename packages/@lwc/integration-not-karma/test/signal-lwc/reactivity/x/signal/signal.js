// Note for testing purposes the signal implementation uses LWC module resolution to simplify things.
// In production the signal will come from a 3rd party library.

import { SignalBaseClass } from 'lwc';

export class Signal extends SignalBaseClass {
    constructor(initialValue) {
        super();
        this.value = initialValue;
    }

    set value(newValue) {
        this._value = newValue;
        this.notify();
    }

    get value() {
        return this._value;
    }

    getSubscriberCount() {
        return this.subscribers.size;
    }
}
