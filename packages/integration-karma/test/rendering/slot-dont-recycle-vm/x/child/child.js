import { LightningElement, track, api } from 'lwc';

export default class Child extends LightningElement {
    @track _open = false;

    get _isOpen() {
        return this._open;
    }

    @api
    open() {
        this._open = true;
    }

    @api
    close() {
        this._open = false;
    }
}
