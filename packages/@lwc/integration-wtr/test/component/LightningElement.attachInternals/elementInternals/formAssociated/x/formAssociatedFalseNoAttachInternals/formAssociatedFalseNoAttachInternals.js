import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    static formAssociated = false;

    @api
    formAssociatedCallbackCalled = false;

    formAssociatedCallback() {
        this.formAssociatedCallbackCalled = true;
    }
}
