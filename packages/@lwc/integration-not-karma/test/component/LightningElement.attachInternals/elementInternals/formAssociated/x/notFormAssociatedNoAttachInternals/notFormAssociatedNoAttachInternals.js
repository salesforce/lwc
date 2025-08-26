import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    @api
    formAssociatedCallbackCalled = false;

    formAssociatedCallback() {
        this.formAssociatedCallbackCalled = true;
    }
}
