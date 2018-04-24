import { Element, track, api } from 'engine';

export default class Child extends Element {
    @track internalLabel;

    @api get ariaLabel() {
        return this.internalLabel;
    }

    @api set ariaLabel(value) {
        this.internalLabel = value;
    }
}
