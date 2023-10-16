import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    @api
    formAssociatedCallbackHasBeenCalled = false;

    formAssociatedCallback() {
        this.formAssociatedCallbackHasBeenCalled = true;
    }
}
