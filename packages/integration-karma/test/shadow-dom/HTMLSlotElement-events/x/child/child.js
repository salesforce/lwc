import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    slotChangeCount = 0;

    @api
    getSlotChangeCount() {
        return this.slotChangeCount;
    }

    @api
    setSlotChangeCount(value) {
        this.slotChangeCount = value;
    }

    handleSlotChange() {
        this.slotChangeCount += 1;
    }
}
