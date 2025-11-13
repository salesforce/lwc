import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    @api children = [{ uid: '1', name: 'child1' }];
    connectedCallback() {
        window.timingBuffer.push('parent:connectedCallback');
    }
    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
    disconnectedCallback() {
        // This component could get disconnected by our test setup after `window.timingBuffer` has
        // already been cleared; we don't care about the `disconnectedCallback`s in that case.
        if (window.timingBuffer) {
            window.timingBuffer.push('parent:disconnectedCallback');
        }
    }
    @api
    addChild() {
        const uid = this.children.length + 1;
        this.children = [...this.children, { uid, name: `child${uid}` }];
    }
    @api
    disconnectLastChild() {
        this.children = this.children.slice(0, this.children.length - 1);
    }
}
