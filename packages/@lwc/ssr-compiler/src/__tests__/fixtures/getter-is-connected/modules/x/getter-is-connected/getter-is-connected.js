import { LightningElement, track } from 'lwc';
import tmpl from './getter-is-connected.html';

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

    render() {
        this.hooks.push(`render: ${this.isConnected}`);
        return tmpl;
    }
}
