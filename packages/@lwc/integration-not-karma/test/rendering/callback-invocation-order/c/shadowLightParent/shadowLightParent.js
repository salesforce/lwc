import { LightningElement } from 'lwc';

export default class ShadowLightParent extends LightningElement {
    connectedCallback() {
        window.timingBuffer.push(`shadowLightParent:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`shadowLightParent:disconnectedCallback`);
    }
}
