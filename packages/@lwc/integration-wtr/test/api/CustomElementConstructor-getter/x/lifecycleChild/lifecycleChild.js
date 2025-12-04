import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    constructor() {
        super();
        window.timingBuffer.push('child:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('child:connectedCallback');
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('child:disconnectedCallback');
        }
    }

    renderedCallback() {
        window.timingBuffer.push('child:renderedCallback');
    }
}
