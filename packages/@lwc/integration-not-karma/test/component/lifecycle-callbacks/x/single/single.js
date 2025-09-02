import { LightningElement, api } from 'lwc';

export default class Single extends LightningElement {
    @api value = 'foo';

    constructor() {
        super();
        window.timingBuffer.push('single:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('single:connectedCallback');
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('single:disconnectedCallback');
        }
    }

    renderedCallback() {
        window.timingBuffer.push('single:renderedCallback');
    }
}
