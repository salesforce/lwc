import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static formAssociated = true;

    @api
    formAssociatedCallbackHasBeenCalled = false;

    @api
    formDisabledCallbackHasBeenCalled = false;

    @api
    formResetCallbackHasBeenCalled = false;

    @api
    formAssociatedCallbackHasBeenCalledWith;

    @api
    formDisabledCallbackHasBeenCalledWith;

    @api
    formResetCallbackHasBeenCalledWith;

    @api
    get internals() {
        if (!this._internals) {
            this._internals = this.attachInternals();
        }
        return this._internals;
    }

    formAssociatedCallback(form) {
        this.formAssociatedCallbackHasBeenCalled = true;
        this.formAssociatedCallbackHasBeenCalledWith = form;
    }

    formDisabledCallback(disabled) {
        this.formDisabledCallbackHasBeenCalled = true;
        this.formDisabledCallbackHasBeenCalledWith = disabled;
    }

    formResetCallback(expectUndefinedHere) {
        this.formResetCallbackHasBeenCalled = true;
        this.formResetCallbackHasBeenCalledWith = expectUndefinedHere;
    }
}
