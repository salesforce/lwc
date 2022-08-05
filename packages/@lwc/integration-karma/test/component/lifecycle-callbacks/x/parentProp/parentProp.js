import { LightningElement, api } from 'lwc';

export default class ParentProp extends LightningElement {
    @api value = 'foo';

    connectedCallback() {
        window.timingBuffer.push('parentProp:connectedCallback');
    }

    disconnectedCallback() {
        if (window.timingBuffer) {
            window.timingBuffer.push('parentProp:disconnectedCallback');
        }
    }

    renderedCallback() {
        window.timingBuffer.push('parentProp:renderedCallback');
    }
}
