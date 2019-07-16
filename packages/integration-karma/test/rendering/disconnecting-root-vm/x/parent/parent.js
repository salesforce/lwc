import { LightningElement, api } from 'lwc';

export default class ParentCmp extends LightningElement {
    @api labels = [];
    _error = null;

    @api getError() {
        return this._error;
    }

    errorCallback(error) {
        this._error = error;
    }
}
