import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api uid;
    connectedCallback() {
        window.timingBuffer.push(`item-wrapper-${this.uid}:connectedCallback`);
    }
    renderedCallback() {
        window.timingBuffer.push(`item-wrapper-${this.uid}:renderedCallback`);
    }
    disconnectedCallback() {
        // This component could get disconnected by our Karma `test-setup.js` after `window.timingBuffer` has
        // already been cleared; we don't care about the `disconnectedCallback`s in that case.
        if (window.timingBuffer) {
            window.timingBuffer.push(`item-wrapper-${this.uid}:disconnectedCallback`);
        }
    }
}
