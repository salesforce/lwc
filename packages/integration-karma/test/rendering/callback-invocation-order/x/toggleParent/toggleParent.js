import { LightningElement } from 'lwc';

export default class ToggleParent extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push('parent:connectedCallback');
    }

    disconnectedCallback() {
        window.timingBuffer.push('parent:disconnectedCallback');
    }
}
