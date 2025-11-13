import { LightningElement, track, api } from 'lwc';

export default class extends LightningElement {
    @api attributeChangedCallbackCalls = [];
    @api apiSetterCallCounts = 0;

    _api;
    @track track;

    get api() {
        return this._api;
    }
    @api
    set api(val) {
        this.apiSetterCallCounts++;
        this._api = val;
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        this.attributeChangedCallbackCalls.push([attrName, oldValue, newValue]);
    }

    static observedAttributes = ['observed'];
}
