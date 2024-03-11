import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    static formAssociated = true;

    @api
    formAssociatedCallbackCalled = false;

    formAssociatedCallback() {
        this.formAssociatedCallbackCalled = true;
    }
}
