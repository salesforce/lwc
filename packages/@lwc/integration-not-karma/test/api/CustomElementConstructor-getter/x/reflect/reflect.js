import { LightningElement, api } from 'lwc';

export default class Reflect extends LightningElement {
    _number;

    @api
    get number() {
        return this._number;
    }
    set number(value) {
        this._number = parseInt(value, 10);
    }

    @api runInComponentContext(fn) {
        fn(this);
    }
}
