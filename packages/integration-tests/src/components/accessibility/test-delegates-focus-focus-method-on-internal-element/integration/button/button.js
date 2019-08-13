import { api, LightningElement } from 'lwc';

export default class Foo extends LightningElement {
    static delegatesFocus = true;

    @api
    focus() {
        this.template.querySelector('button').focus();
    }
}
