import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    constructor() {
        super();
        this._style = this.style;
    }

    @api
    get test() {
        return this._style;
    }
}
