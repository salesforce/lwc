import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    static formAssociated = true;

    @api
    internals;

    @api
    formAssociatedCallbackHasBeenCalled = false;

    @api
    formDisabledCallbackHasBeenCalled = false;

    @api
    formResetCallbackHasBeenCalled = false;

    constructor() {
        super();
        this.internals = this.attachInternals();
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
