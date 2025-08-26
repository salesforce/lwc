import { LightningElement, api } from 'lwc';

export default class ChildSlotTagWithKey extends LightningElement {
    static renderMode = 'light';
    @api items;

    renderedCallback() {
        window.timingBuffer.push('childSlotTagWithKey:renderedCallback');
    }
}
