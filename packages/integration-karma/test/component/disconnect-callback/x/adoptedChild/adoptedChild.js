import { LightningElement } from 'lwc';

export default class AdoptedChild extends LightningElement {
    constructor() {
        super();
        window.timingBuffer.push('adoptedChild:constructor');
    }

    connectedCallback() {
        window.timingBuffer.push('adoptedChild:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('adoptedChild:disconnectedCallback');
    }

    renderedCallback() {
        window.timingBuffer.push('adoptedChild:renderedCallback');
    }
}
