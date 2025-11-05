import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    _myClass = '';

    @api foo;

    set myClass(val) {
        this._myClass = val;
    }

    get myClass() {
        // side effect here
        this.foo = 'foo';

        return this._myClass;
    }
}
