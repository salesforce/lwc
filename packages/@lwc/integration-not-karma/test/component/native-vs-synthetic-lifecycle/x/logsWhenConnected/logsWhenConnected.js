import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push('<x-logs-when-connected>: connectedCallback');
    }
}
