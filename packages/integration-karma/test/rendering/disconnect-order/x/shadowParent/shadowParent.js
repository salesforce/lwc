import { LightningElement } from 'lwc';

export default class ShadowParent extends LightningElement {
    disconnectedCallback() {
        window.timingBuffer.push(`shadowParent:disconnectedCallback`);
    }
}
