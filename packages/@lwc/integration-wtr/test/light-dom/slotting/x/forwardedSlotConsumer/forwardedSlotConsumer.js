import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    slot = true;

    @api
    shouldSlot(shouldSlot) {
        this.slot = shouldSlot;
    }
}
