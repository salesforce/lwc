import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    constructor() {
        super();
        if (window.timingBuffer) {
            window.timingBuffer.push('child:constructor');
        }
    }

    connectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('child:connectedCallback');
        }
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('child:disconnectedCallback');
        }
    }

    renderedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('child:renderedCallback');
        }
    }
}
