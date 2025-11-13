import { LightningElement, api } from 'lwc';

export default class AcceptingSlots extends LightningElement {
    @api disconnect;

    disconnectedCallback() {
        this.disconnect();
    }
}
