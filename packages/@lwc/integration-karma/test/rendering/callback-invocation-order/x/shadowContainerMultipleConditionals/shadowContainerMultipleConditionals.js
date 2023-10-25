import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    showIf = false;

    @api
    showElseIf = false;

    @api
    leafName;

    connectedCallback() {
        window.timingBuffer.push(`shadowContainer:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`shadowContainer:disconnectedCallback`);
    }
}
