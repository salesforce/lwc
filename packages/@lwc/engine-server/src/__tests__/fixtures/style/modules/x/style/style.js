import { LightningElement } from 'lwc';

export default class Style extends LightningElement {
    constructor() {
        super();
        this._style = this.style;
    }

    get test() {
        return this._style;
    }
}
