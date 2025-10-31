import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api result = 'initial value';

    constructor() {
        super();
        this.result = this.refs;
    }
}
