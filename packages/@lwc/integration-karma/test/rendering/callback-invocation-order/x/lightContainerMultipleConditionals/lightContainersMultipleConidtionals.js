import { LightningElement, api } from 'lwc';

export default class LightContainer extends LightningElement {
    static renderMode = 'light';

    @api
    showIf = false;

    @api
    showElseIf = false;

    connectedCallback() {
        window.timingBuffer.push(`lightContainer:connectedCallback`);
    }

    disconnectedCallback() {
        window.timingBuffer.push(`lightContainer:disconnectedCallback`);
    }
}
