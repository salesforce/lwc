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
    get internals() {
        if (!this._internals) {
            this._internals = this.attachInternals();
        }
        return this._internals;
    }

    formAssociatedCallback() {
        this.formAssociatedCallbackHasBeenCalled = true;
    }

    formDisabledCallback() {
        this.formDisabledCallbackHasBeenCalled = true;
    }

    formResetCallback() {
        this.formResetCallbackHasBeenCalled = true;
    }
}
