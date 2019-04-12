import { LightningElement, api } from 'lwc';

export default class NestedSlots extends LightningElement {
    @api
    slotChangeCount = 0;

    handleSlotChange() {
        this.slotChangeCount += 1;
    }
}
