import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    internals;

    constructor() {
        super();
        this.internals = this.attachInternals();
    }
}
