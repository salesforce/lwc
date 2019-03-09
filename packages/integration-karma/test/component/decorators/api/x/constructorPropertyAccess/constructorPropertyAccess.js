import { LightningElement, api } from 'lwc';

export default class ConstructorGet extends LightningElement {
    @api prop;

    constructor() {
        super();
        this.prop;
    }
}
