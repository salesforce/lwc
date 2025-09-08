import { LightningElement } from 'lwc';

export default class LightContainer extends LightningElement {
    static renderMode = 'light';

    connectedCallback() {
        window.timingBuffer.push(`lightContainer:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`lightContainer:disconnectedCallback`);
    }
}
