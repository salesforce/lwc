import { LightningElement } from 'lwc';

export default class LightShadowParent extends LightningElement {
    static renderMode = 'light';

    disconnectedCallback() {
        window.timingBuffer.push(`lightShadowContainer:disconnectedCallback`);
    }
}
