import { LightningElement } from 'lwc';

export default class ShadowContainer extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push(`shadowContainer:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`shadowContainer:disconnectedCallback`);
    }
}
