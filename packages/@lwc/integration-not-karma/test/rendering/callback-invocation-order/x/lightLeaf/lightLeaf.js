import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api name = Math.random();

    connectedCallback() {
        window.timingBuffer.push(`leaf:${this.name}:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`leaf:${this.name}:disconnectedCallback`);
    }
}
