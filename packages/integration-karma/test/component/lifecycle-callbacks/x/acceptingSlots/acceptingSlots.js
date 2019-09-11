import { LightningElement } from 'lwc';

export default class AcceptingSlots extends LightningElement {
    constructor() {
        super();
        window.timingBuffer.push('accepting-slot:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('accepting-slot:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('accepting-slot:disconnectedCallback');
    }

    renderedCallback() {
        window.timingBuffer.push('accepting-slot:renderedCallback');
    }
}
