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
    disconnectedCallback() {
        // This component could get disconnected by our Karma `test-setup.js` after `window.timingBuffer` has
        // already been cleared; we don't care about the `disconnectedCallback`s in that case.
        if (window.timingBuffer) {
            window.timingBuffer.push(`foo-${this.externalClassName}:disconnectedCallback`);
        }
    }
}
