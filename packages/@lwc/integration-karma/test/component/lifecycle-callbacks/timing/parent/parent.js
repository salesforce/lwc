import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    @api value;
    constructor() {
        super();
        window.timingBuffer.push('parent:constructor');
    }
    connectedCallback() {
        window.timingBuffer.push('parent:connectedCallback');
    }
    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
    disconnectedCallback() {
        // This component could get disconnected by our Karma `test-setup.js` after `window.timingBuffer` has
        // already been cleared; we don't care about the `disconnectedCallback`s in that case.
        if (window.timingBuffer) {
            window.timingBuffer.push('parent:disconnectedCallback');
        }
    }
}
