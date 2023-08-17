import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    internals;

    connectedCallback() {
        this.internals = this.attachInternals();
    }

    @api
    callAttachInternals() {
        this.internals = this.attachInternals();
    }

    @api
    hasElementInternalsBeenSet() {
        return Boolean(this.internals);
    }
}
