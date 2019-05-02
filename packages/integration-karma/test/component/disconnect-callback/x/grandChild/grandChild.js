import { LightningElement } from 'lwc';

export default class GrandChild extends LightningElement {
    constructor() {
        super();
        window.timingBuffer.push('grandChild:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('grandChild:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('grandChild:disconnectedCallback');
    }

    renderedCallback() {
        window.timingBuffer.push('grandChild:renderedCallback');
    }
}
