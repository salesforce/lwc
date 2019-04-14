import { LightningElement, api } from 'lwc';

export default class ChildDoesListenForSlotChange extends LightningElement {
    @api
    slotChangeCount = 0;

    handleSlotChange() {
        this.slotChangeCount += 1;
    }
}
