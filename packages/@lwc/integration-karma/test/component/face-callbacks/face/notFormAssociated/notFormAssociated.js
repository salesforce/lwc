import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    formAssociatedCallbackHasBeenCalled = false;

    formAssociatedCallback() {
        this.formAssociatedCallbackHasBeenCalled = true;
    }
}
