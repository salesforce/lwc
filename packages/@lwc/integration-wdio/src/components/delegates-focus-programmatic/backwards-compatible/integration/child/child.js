import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    static delegatesFocus = true;

    @api
    focus() {
        this.template.querySelector('textarea').focus();
    }
}
