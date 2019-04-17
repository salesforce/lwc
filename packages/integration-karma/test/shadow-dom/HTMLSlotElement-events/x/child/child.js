import { LightningElement, api } from 'lwc';

export default class ChildDoesListenForSlotChange extends LightningElement {
    _slotChangeCount = 0;

    @api
    get slotChangeCount() {
        return this._slotChangeCount;
    }
    set slotChangeCount(value) {
        this._slotChangeCount = value;
    }

    handleSlotChange() {
        this.slotChangeCount += 1;
    }
}
