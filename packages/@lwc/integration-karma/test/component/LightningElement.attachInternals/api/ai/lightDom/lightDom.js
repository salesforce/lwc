import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    connectedCallback() {
        this.internals = this.attachInternals();
    }
}
