import { LightningElement, api } from 'lwc';

export default class AcceptingSlots extends LightningElement {
    @api connect;

    connectedCallback() {
        this.connect && this.connect();
    }
}
