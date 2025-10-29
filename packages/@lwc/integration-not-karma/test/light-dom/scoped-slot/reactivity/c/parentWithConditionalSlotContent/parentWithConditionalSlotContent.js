import { LightningElement, track, api } from 'lwc';

export default class ParentWithConditionalSlotContent extends LightningElement {
    @track
    data = { variation1: true, variation2: false };

    @api
    enableVariation2() {
        this.data.variation2 = true;
    }

    @api
    disableAllVariations() {
        this.data.variation1 = false;
        this.data.variation2 = false;
    }
}
