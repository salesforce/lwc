import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api uid;
    @api children = [{ uid: '1' }];
    connectedCallback() {
        window.timingBuffer.push(`child${this.uid}:connectedCallback`);
    }
    renderedCallback() {
        window.timingBuffer.push(`child${this.uid}:renderedCallback`);
    }
    disconnectedCallback() {
        // This component could get disconnected by our test setup after `window.timingBuffer` has
        // already been cleared; we don't care about the `disconnectedCallback`s in that case.
        if (window.timingBuffer) {
            window.timingBuffer.push(`child${this.uid}:disconnectedCallback`);
        }
    }
    @api
    addChild() {
        this.children = [...this.children, { uid: `${this.children.length + 1}` }];
    }
}
