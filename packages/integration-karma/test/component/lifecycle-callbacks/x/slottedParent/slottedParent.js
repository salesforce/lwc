import { LightningElement } from 'lwc';

export default class SlottedParent extends LightningElement {
    constructor() {
        super();
        window.timingBuffer.push('slotted-parent:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('slotted-parent:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('slotted-parent:disconnectedCallback');
    }

    renderedCallback() {
        window.timingBuffer.push('slotted-parent:renderedCallback');
    }
}
