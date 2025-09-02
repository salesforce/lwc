import { LightningElement, api, track } from 'lwc';

export default class PrivateAccessors extends LightningElement {
    _privateProp;
    get privateProp() {
        return this._privateProp;
    }

    set privateProp(newValue) {
        this._privateProp = newValue;
    }

    _publicProp;
    @api
    get publicProp() {
        return this._publicProp;
    }

    set publicProp(newValue) {
        this._publicProp = newValue;
    }

    nonDecoratedPrivateProp = 'foo';

    @track
    trackedProp = 'bar';
}
