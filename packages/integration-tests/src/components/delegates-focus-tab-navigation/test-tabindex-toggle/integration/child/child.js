import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    static delegatesFocus = true;

    @api
    get tabIndex() {
        return this.privateTabIndex;
    }
    set tabIndex(value) {
        if (value === null) {
            return this.removeAttribute('tabindex');
        }
        this.setAttribute('tabindex', value);
    }
}
