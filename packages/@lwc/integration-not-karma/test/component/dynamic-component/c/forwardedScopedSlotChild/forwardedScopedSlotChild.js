import { LightningElement } from 'lwc';
import Baz from 'c/baz';
import Slottable from 'c/slottable';

export default class extends LightningElement {
    static renderMode = 'light';
    // This is a component containing a regular slot
    slotWrapperCtor;
    // Constructor that will be passed to the parent
    childSlotData;

    connectedCallback() {
        this.slotWrapperCtor = Slottable;
        this.childSlotData = Baz;
    }
}
