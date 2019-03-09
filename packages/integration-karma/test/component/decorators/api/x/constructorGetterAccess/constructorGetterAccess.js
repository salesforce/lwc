import { LightningElement, api } from 'lwc';

export default class ConstructorGet extends LightningElement {
    _privateValue = 'private';

    @api
    get publicAccessor() {
        return this._privateValue;
    }

    constructor() {
        super();
        this.publicAccessor;
    }
}
