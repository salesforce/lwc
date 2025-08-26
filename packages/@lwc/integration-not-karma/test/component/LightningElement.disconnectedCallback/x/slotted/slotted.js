import { LightningElement, api } from 'lwc';

export default class Slotted extends LightningElement {
    @api disconnect;
    @api hideChildIgnoresSlots = false;
    @api hideChildAcceptsSlots = false;

    disconnectedCallback() {
        this.disconnect();
    }
}
