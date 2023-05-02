import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    _baz = undefined;
    @api get baz() {
        return this._baz;
    }
    set baz(val) {
        this._baz = val;
    }
}
