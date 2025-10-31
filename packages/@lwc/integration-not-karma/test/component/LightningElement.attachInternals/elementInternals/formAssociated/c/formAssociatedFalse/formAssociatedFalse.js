import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    static formAssociated = false;

    @api
    internals;

    constructor() {
        super();
        this.internals = this.attachInternals();
    }
}
