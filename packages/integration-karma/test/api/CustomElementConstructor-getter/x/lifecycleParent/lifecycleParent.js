import { LightningElement } from 'lwc';

export default class LifecycleParent extends LightningElement {
    constructor() {
        super();
        if (window.timingBuffer) {
            window.timingBuffer.push('parent:constructor');
        }
    }

    connectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('parent:connectedCallback');
        }
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('parent:disconnectedCallback');
        }
    }

    renderedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('parent:renderedCallback');
        }
    }
}
