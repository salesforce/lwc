import { LightningElement, api } from 'lwc';

export default class ConstructorGet extends LightningElement {
    _privateValue = 'private';

    @api
    get publicAccessor() {
        return this._privateValue;
    }

    constructor() {
        super();
        // Testing the getter; don't need to use the return value
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.publicAccessor;
    }
}
