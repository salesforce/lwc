import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api name;

    disconnectedCallback() {
        window.timingBuffer.push(`parent:${this.name}:disconnectedCallback`);
    }
}
