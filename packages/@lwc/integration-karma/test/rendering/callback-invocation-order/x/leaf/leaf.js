import { LightningElement, api } from 'lwc';

export default class LeafA extends LightningElement {
    @api name;

    connectedCallback() {
        window.timingBuffer.push(`leaf:${this.name}:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`leaf:${this.name}:disconnectedCallback`);
    }
}
