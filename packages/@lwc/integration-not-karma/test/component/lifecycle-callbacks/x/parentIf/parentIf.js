import { LightningElement, api } from 'lwc';

export default class ParentIf extends LightningElement {
    @api childVisible = false;

    connectedCallback() {
        window.timingBuffer.push('parentIf:connectedCallback');
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('parentIf:disconnectedCallback');
        }
    }

    renderedCallback() {
        window.timingBuffer.push('parentIf:renderedCallback');
    }
}
