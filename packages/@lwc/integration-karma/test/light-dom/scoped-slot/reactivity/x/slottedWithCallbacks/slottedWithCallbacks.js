import { LightningElement, api } from 'lwc';

export default class SlottedChild extends LightningElement {
    @api
    identifier;
    @api
    label;

    constructor() {
        super();
        window.timingBuffer.push(`child:constructor`); // cannot access identifier in construction phase
    }

    connectedCallback() {
        window.timingBuffer.push(`child-${this.identifier}:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer &&
            window.timingBuffer.push(`child-${this.identifier}:disconnectedCallback`);
    }

    renderedCallback() {
        window.timingBuffer.push(`child-${this.identifier}:renderedCallback`);
    }
}
