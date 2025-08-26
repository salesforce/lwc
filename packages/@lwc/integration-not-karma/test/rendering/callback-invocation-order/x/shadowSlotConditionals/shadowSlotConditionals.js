import { LightningElement, api } from 'lwc';

export default class ShadowSlotConditionals extends LightningElement {
    @api
    showIf = false;

    @api
    showElseIf = false;

    connectedCallback() {
        window.timingBuffer.push(`shadowSlot:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`shadowSlot:disconnectedCallback`);
    }
}
