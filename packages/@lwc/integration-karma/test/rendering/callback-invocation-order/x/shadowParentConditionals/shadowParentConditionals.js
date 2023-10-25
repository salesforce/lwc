import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    showIf = false;

    @api
    showElseIf = false;

    connectedCallback() {
        window.timingBuffer.push(`shadowParent:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`shadowParent:disconnectedCallback`);
    }
}
