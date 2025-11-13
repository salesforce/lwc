import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api name;

    connectedCallback() {
        window.timingBuffer.push(`parent:${this.name}:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`parent:${this.name}:disconnectedCallback`);
    }
}
