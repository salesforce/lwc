import { LightningElement, api } from 'lwc';

export default class ChildDoesListenForSlotChange extends LightningElement {
    @api
    slotChangeCount = 0;

    @api
    bubblingSlotChangeCount = 0;

    handleSlotChange() {
        this.slotChangeCount += 1;
    }

    handleBubblingSlotChange() {
        this.bubblingSlotChangeCount += 1;
    }

    connectedCallback() {
        this.template.addEventListener('slotchange', this.handleBubblingSlotChange);
    }
}
