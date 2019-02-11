import { LightningElement, api } from 'lwc';

export default class ParentIf extends LightningElement {
    @api childVisible = false;

    connectedCallback() {
        window.timingBuffer.push('parentIf:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('parentIf:disconnectedCallback');
    }

    renderedCallback() {
        window.timingBuffer.push('parentIf:renderedCallback');
    }
}
