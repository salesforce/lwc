import { LightningElement, track, api } from 'lwc';

export default class Child extends LightningElement {
    @track internalLabel;

    @api get ariaLabel() {
        return this.internalLabel;
    }

    set ariaLabel(value) {
        this.internalLabel = value;
    }
}
