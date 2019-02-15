import { LightningElement } from 'lwc';

export default class Parent extends LightningElement {
    constructor() {
        super();
        window.timingBuffer.push('parent:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('parent:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('parent:disconnectedCallback');
    }

    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
}
