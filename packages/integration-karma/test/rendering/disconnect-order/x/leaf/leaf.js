import { LightningElement, api } from 'lwc';

export default class LeafA extends LightningElement {
    @api name;

    disconnectedCallback() {
        window.timingBuffer.push(`leaf:${this.name}:disconnectedCallback`);
    }
}
