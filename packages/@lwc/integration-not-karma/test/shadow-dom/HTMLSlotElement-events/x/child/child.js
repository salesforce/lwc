import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    slotChangeCount = 0;
    showSlot = true;

    @api
    getSlotChangeCount() {
        return this.slotChangeCount;
    }

    @api
    setSlotChangeCount(value) {
        this.slotChangeCount = value;
    }

    @api
    removeSlot() {
        this.showSlot = false;
    }

    handleSlotChange() {
        this.slotChangeCount += 1;
    }
}
