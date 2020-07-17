import { LightningElement, track } from 'lwc';

export default class extends LightningElement {
    @track
    hooks = [];

    constructor() {
        super();
        this.hooks.push(`constructor: ${this.isConnected}`);
    }

    connectedCallback() {
        this.hooks.push(`connectedCallback: ${this.isConnected}`);
    }
}
