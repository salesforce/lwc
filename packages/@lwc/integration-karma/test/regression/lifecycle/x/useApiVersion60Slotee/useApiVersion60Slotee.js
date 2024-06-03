import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push('x-use-api-version-60-slotee: connectedCallback');
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('x-use-api-version-60-slotee: disconnectedCallback');
        }
    }
}
