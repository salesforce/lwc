import { SignalBaseClass } from '@lwc/signals';

export default class Signal extends SignalBaseClass {
    _value;

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