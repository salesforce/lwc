import { LightningElement } from 'lwc';

export default class MultipleSlot extends LightningElement {
    toggleSlottedText() {
        this.template.querySelector('x-multiple-slot-level1').toggle();
    }
}
