import { LightningElement, track } from 'lwc';

export default class extends LightningElement {
    @track
    hooks = [];

    constructor() {
        super();

        if (this.isConnected) {
            this.hooks.push('constructor');
        }
    }

    connectedCallback() {
        if (this.isConnected) {
            this.hooks.push('connectedCallback');
        }
    }
}
