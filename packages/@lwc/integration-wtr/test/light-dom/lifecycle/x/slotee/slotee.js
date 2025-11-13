import { LightningElement } from 'lwc';
import { getId } from '../../util.js';

export default class extends LightningElement {
    static renderMode = 'light';

    uuid = getId();

    connectedCallback() {
        window.timingBuffer.push(`${this.uuid}:connectedCallback`);
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push(`${this.uuid}:disconnectedCallback`);
        }
    }
}
