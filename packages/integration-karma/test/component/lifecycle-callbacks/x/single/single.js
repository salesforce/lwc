import { LightningElement, api } from 'lwc';

export default class Single extends LightningElement {
    @api value = 'foo';

    constructor() {
        super();
        timingBuffer.push('single:constructor');
    }

    connectedCallback() {
        timingBuffer.push('single:connectedCallback');
    }

    disconnectedCallback() {
        timingBuffer.push('single:disconnectedCallback');
    }

    renderedCallback() {
        timingBuffer.push('single:renderedCallback');
    }
}
