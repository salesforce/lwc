import { LightningElement } from 'lwc';

export default class ShadowParent extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push(`shadowParent:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`shadowParent:disconnectedCallback`);
    }
}
