import { LightningElement } from 'lwc';

export default class LightParent extends LightningElement {
    static renderMode = 'light';

    disconnectedCallback() {
        window.timingBuffer.push(`lightParent:disconnectedCallback`);
    }
}
