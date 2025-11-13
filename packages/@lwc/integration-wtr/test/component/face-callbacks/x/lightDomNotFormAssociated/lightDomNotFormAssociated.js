import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    @api
    formAssociatedCallbackHasBeenCalled = false;

    @api
    formDisabledCallbackHasBeenCalled = false;

    @api
    formResetCallbackHasBeenCalled = false;

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
