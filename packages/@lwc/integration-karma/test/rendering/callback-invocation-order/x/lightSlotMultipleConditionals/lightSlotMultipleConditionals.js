import { LightningElement, api } from 'lwc';

export default class LightParentMultipleConditionals extends LightningElement {
    static renderMode = 'light';

    @api
    showIf = false;

    @api
    showElseIf = false;

    connectedCallback() {
        window.timingBuffer.push(`lightSlot:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`lightSlot:disconnectedCallback`);
    }
}
