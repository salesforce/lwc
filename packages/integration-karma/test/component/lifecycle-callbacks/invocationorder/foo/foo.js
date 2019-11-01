import { LightningElement } from 'lwc';

export default class Foo extends LightningElement {
    get externalClassName() {
        return this.getAttribute('class');
    }
    get internalClassName() {
        return `foo-internal-${this.externalClassName}`;
    }
    connectedCallback() {
        window.timingBuffer.push(`foo-${this.externalClassName}:connectedCallback`);
    }
    renderedCallback() {
        window.timingBuffer.push(`foo-${this.externalClassName}:renderedCallback`);
    }
}
