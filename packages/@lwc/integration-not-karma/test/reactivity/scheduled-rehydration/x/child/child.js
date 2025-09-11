import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    _called = 0;
    _value = 'default';

    @api
    set value(val) {
        this._value = val;
    }

    get value() {
        this._called++;
        return this._value;
    }

    @api
    get called() {
        return this._called;
    }

    @api
    connectedCallbackCalled = 0;

    @api
    disconnectedCallbackCalled = 0;

    @api
    renderedCallbackCalled = 0;

    connectedCallback() {
        this.connectedCallbackCalled++;
    }

    disconnectedCallback() {
        this.disconnectedCallbackCalled++;
    }

    renderedCallback() {
        this.renderedCallbackCalled++;
    }
}
