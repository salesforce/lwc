import { LightningElement } from 'lwc';

export default class FooInternal extends LightningElement {
    get externalClassName() {
        return this.getAttribute('class');
    }
    connectedCallback() {
        window.timingBuffer.push(`${this.externalClassName}:connectedCallback`);
    }
    renderedCallback() {
        window.timingBuffer.push(`${this.externalClassName}:renderedCallback`);
    }
}
