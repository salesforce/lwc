import { LightningElement } from 'lwc';

export default class LightContainer extends LightningElement {
    static renderMode = 'light';

    disconnectedCallback() {
        window.timingBuffer.push(`lightContainer:disconnectedCallback`);
    }
}
