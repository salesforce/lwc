import { LightningElement } from 'lwc';

export default class HostStyle extends LightningElement {
    constructor() {
        super();
        this._hostStyle = this.hostStyle;
    }

    get test() {
        return this._hostStyle;
    }
}
