import { LightningElement, api } from 'lwc';

export default class ParentProp extends LightningElement {
    @api value = 'foo';

    connectedCallback() {
        timingBuffer.push('parentProp:connectedCallback');
    }

    disconnectedCallback() {
        timingBuffer.push('parentProp:disconnectedCallback');
    }

    renderedCallback() {
        timingBuffer.push('parentProp:renderedCallback');
    }
}
