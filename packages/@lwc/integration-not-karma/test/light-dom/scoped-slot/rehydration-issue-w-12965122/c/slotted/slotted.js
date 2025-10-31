import { LightningElement, api } from 'lwc';

export default class Slotted extends LightningElement {
    @api attr;
    @api label;
    renderedCallback() {
        window.timingBuffer.push('slotted:renderedCallback');
    }
}
