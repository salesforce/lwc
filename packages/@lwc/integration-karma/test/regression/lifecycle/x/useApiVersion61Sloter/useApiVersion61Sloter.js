import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push('x-use-api-version-61-sloter: connectedCallback');
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('x-use-api-version-61-sloter: disconnectedCallback');
        }
    }
}
