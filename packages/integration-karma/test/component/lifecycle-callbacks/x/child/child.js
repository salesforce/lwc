import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api value;

    constructor() {
        super();
        timingBuffer.push('child:constructor');
    }

    connectedCallback() {
        timingBuffer.push('child:connectedCallback');
    }

    disconnectedCallback() {
        timingBuffer.push('child:disconnectedCallback');
    }

    renderedCallback() {
        timingBuffer.push('child:renderedCallback');
    }
}
