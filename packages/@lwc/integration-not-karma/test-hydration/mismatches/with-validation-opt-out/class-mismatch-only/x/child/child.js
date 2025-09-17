import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static validationOptOut = ['class'];

    connectedCallback() {
        this.classList.add('bar');
    }
}
