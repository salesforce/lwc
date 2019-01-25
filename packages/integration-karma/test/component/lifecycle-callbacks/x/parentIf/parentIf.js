import { LightningElement, api } from 'lwc';

export default class ParentIf extends LightningElement {
    @api childVisible = false;

    connectedCallback() {
        timingBuffer.push('parentIf:connectedCallback');
    }

    disconnectedCallback() {
        timingBuffer.push('parentIf:disconnectedCallback');
    }

    renderedCallback() {
        timingBuffer.push('parentIf:renderedCallback');
    }
}
