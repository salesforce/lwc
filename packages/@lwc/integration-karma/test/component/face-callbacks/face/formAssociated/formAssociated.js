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
        return this.attachInternals();
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
