import { LightningElement, track } from 'lwc';

export default class Child extends LightningElement {
    @track
    slotChangeCount = 0;

    handleSlotChange() {
        this.slotChangeCount += 1;
    }
}
