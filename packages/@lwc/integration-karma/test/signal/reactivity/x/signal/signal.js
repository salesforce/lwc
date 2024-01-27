import { SignalBaseClass } from 'lwc';

export class Signal extends SignalBaseClass {
    constructor(initialValue) {
        super();
        this._value = initialValue;
    }

    set value(newValue) {
        this._value = newValue;
        this.notify();
    }

    get value() {
        return this._value;
    }
}
