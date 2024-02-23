import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    constructor() {
        super();
        this._hostStyle = this.hostStyle;
    }

    @api
    get test() {
        return this._hostStyle;
    }
}
