import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api signal;

    connectedCallback() {
        this.signal.value = 'updated value';
    }
}
