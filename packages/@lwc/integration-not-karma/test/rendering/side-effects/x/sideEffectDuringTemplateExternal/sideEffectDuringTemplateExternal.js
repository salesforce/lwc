import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api foo;
    @api bar = '';

    _myClass = '';

    set myClass(val) {
        this._myClass = val;
    }

    get myClass() {
        // side effect here
        const elm = this.template.querySelector('x-child-with-api-getter-setter');
        if (elm) {
            elm.baz = 'baz';
        }

        return this._myClass;
    }
}
