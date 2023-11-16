import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static validationOptOut = ['foo'];

    connectedCallback() {
        this.classList.add('bar');
    }
}
