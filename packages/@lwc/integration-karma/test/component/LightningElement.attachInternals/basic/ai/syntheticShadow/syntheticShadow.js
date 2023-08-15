import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        this.internals = this.attachInternals();
    }
}
