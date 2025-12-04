import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    constructor() {
        super();
        this._tagName = this.tagName;
    }

    @api
    get test() {
        return this._tagName;
    }
}
