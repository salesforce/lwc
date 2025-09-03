import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    @api value = 'foo';
    constructor() {
        super();
        window.timingBuffer.push('child:constructor');
    }
    connectedCallback() {
        window.timingBuffer.push('child:connectedCallback');
    }
    renderedCallback() {
        window.timingBuffer.push('child:renderedCallback');
    }
    disconnectedCallback() {
        // This component could get disconnected by our Karma `test-setup.js` after `window.timingBuffer` has
        // already been cleared; we don't care about the `disconnectedCallback`s in that case.
        if (window.timingBuffer) {
            window.timingBuffer.push('child:disconnectedCallback');
        }
    }
}
