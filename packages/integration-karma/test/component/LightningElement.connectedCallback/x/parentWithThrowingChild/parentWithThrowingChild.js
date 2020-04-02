import { LightningElement, api } from 'lwc';

export default class ChildsConnectedCallbackThrow extends LightningElement {
    @api
    error;

    errorCallback(error, stack) {
        this.error = error;
        this.stack = stack;
    }
}
