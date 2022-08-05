import { LightningElement } from 'lwc';

export default class ShadowLightParent extends LightningElement {
    disconnectedCallback() {
        window.timingBuffer.push(`shadowLightParent:disconnectedCallback`);
    }
}
