import { LightningElement } from 'lwc';

export default class ShadowContainer extends LightningElement {
    disconnectedCallback() {
        window.timingBuffer.push(`shadowContainer:disconnectedCallback`);
    }
}
