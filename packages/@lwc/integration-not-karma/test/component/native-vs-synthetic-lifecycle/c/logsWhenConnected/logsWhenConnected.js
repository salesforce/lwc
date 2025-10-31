import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push('<c-logs-when-connected>: connectedCallback');
    }
}
