import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api name;

    connectedCallback() {
        window.timingBuffer.push(`leaf:${this.name}:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`leaf:${this.name}:disconnectedCallback`);
    }
}
