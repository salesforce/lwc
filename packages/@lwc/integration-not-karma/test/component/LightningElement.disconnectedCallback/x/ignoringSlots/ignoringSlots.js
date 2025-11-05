import { LightningElement, api } from 'lwc';

export default class IgnoringSlots extends LightningElement {
    @api disconnect;

    disconnectedCallback() {
        this.disconnect();
    }
}
