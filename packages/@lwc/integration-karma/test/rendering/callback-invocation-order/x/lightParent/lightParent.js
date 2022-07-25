import { LightningElement } from 'lwc';

export default class LightParent extends LightningElement {
    static renderMode = 'light';

    connectedCallback() {
        window.timingBuffer.push(`lightParent:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`lightParent:disconnectedCallback`);
    }
}
