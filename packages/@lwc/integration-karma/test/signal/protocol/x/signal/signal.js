// Note for testing purposes the signal implementation uses LWC module resolution to simplify things.
// In production the signal will come from a 3rd party library.
export class Signal {
    subscribers = new Set();
    removedSubscribers = [];

    constructor(initialValue) {
        this._value = initialValue;
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
            this.removedSubscribers.push(onUpdate);
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

    getRemovedSubscriberCount() {
        return this.removedSubscribers.length;
    }
}
