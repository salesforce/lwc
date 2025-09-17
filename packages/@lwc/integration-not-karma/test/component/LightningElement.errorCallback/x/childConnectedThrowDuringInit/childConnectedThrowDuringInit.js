import { LightningElement, api } from 'lwc';

export default class ChildConnectedThrowDuringInit extends LightningElement {
    @api error;
    @api errorCallbackCalled = false;

    errorCallback(error) {
        this.errorCallbackCalled = true;
        this.error = { message: error.message };
    }
}
