import { LightningElement } from 'lwc';

export default class LifecycleParent extends LightningElement {
    constructor() {
        super();
        timingBuffer.push('parent:constructor');
    }

    connectedCallback() {
        timingBuffer.push('parent:connectedCallback');
    }

    disconnectedCallback() {
        timingBuffer.push('parent:disconnectedCallback');
    }

    renderedCallback() {
        timingBuffer.push('parent:renderedCallback');
    }
}
