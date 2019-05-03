import { LightningElement } from 'lwc';

export default class OwnChild extends LightningElement {
    constructor() {
        super();
        window.timingBuffer.push('ownChild:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('ownChild:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('ownChild:disconnectedCallback');
    }

    renderedCallback() {
        window.timingBuffer.push('ownChild:renderedCallback');
    }
}
