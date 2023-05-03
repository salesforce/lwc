import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static validationOptOut = true;

    connectedCallback() {
        this.classList.add('bar');
    }
}
