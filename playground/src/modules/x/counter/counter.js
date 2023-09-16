import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    counter = 0;

    _foo = 'foo';

    get foo() {
        return this._foo;
    }

    set foo(newValue) {
        this._foo = newValue;
    }

    _bar = 'bar';

    @api
    get bar() {
        return this._bar;
    }

    set bar(newValue) {
        this._bar = newValue;
    }

    _doe = 'doe';

    set doe(newValue) {
        this._doe = newValue;
    }

    increment() {
        this.counter++;
    }
    decrement() {
        this.counter--;
    }
}
