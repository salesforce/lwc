import { LightningElement } from 'lwc';

export default class LightShadowParent extends LightningElement {
    static renderMode = 'light';

    connectedCallback() {
        window.timingBuffer.push(`lightShadowContainer:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`lightShadowContainer:disconnectedCallback`);
    }
}
