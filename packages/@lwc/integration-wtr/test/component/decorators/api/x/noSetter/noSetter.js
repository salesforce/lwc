import { LightningElement, api } from 'lwc';

export default class GetterSetter extends LightningElement {
    _foo = 'foo';

    @api
    get foo() {
        return this._foo;
    }
}
