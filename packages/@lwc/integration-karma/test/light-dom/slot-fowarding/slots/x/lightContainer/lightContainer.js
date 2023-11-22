import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    upperSlot = 'upper';
    lowerSlot = 'lower';

    @api
    swapLowerAndUpperSlot() {
        const originalUpper = this.upperSlot;
        this.upperSlot = this.lowerSlot;
        this.lowerSlot = originalUpper;
    }
}
