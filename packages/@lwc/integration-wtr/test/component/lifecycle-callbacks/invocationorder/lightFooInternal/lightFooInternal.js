import { LightningElement } from 'lwc';

export default class FooInternal extends LightningElement {
    static renderMode = 'light';
    get externalClassName() {
        return this.getAttribute('class');
    }
    connectedCallback() {
        window.timingBuffer.push(`${this.externalClassName}:connectedCallback`);
    }
    renderedCallback() {
        window.timingBuffer.push(`${this.externalClassName}:renderedCallback`);
    }
    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push(`${this.externalClassName}:disconnectedCallback`);
        }
    }
}
