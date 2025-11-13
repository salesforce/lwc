import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static formAssociated = true;

    @api
    internals;

    constructor() {
        super();
        this.internals = this.attachInternals();
    }
}
