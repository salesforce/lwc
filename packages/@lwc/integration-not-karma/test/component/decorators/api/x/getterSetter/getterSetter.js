import { LightningElement, api } from 'lwc';

export default class GetterSetter extends LightningElement {
    _privateValue;

    @api
    get publicAccessor() {
        return `${this._privateValue}:getter`;
    }
    set publicAccessor(value) {
        this._privateValue = `${value}:setter`;
    }
}
