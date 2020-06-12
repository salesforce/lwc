import { LightningElement } from 'lwc';

export default class MethodRemoveAttribute extends LightningElement {
    connectedCallback() {
        this.setAttribute('data-a', '');
        this.setAttribute('data-b', '');
        this.setAttribute('data-c', '');

        this.removeAttribute('data-b');
        this.removeAttribute('data-unknown');
    }
}