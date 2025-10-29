import { LightningElement, api } from 'lwc';

export default class ShadowContainerMultipleConditionals extends LightningElement {
    @api
    leafName;

    connectedCallback() {
        window.timingBuffer.push(`shadowContainer:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`shadowContainer:disconnectedCallback`);
    }

    @api
    getSlotCmp() {
        return this.template.querySelector('x-shadow-slot-conditionals');
    }

    @api
    getLeaf() {
        return this.template.querySelector('x-leaf');
    }
}
