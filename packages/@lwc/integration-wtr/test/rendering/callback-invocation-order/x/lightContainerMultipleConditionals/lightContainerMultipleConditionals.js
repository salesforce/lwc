import { LightningElement, api } from 'lwc';

export default class LightContainerMultipleConditionals extends LightningElement {
    static renderMode = 'light';

    @api
    leafName;

    connectedCallback() {
        window.timingBuffer.push(`lightContainer:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`lightContainer:disconnectedCallback`);
    }

    @api
    getLeaf() {
        return this.querySelector('x-light-leaf');
    }

    @api
    getSlotCmp() {
        return this.querySelector('x-light-slot-multiple-conditionals');
    }
}
