import { LightningElement, api } from 'lwc';

export default class ChildRenderedThrow extends LightningElement {
    error = {
        message: '',
        wcStack: '',
    };

    @api
    getErrorMessage() {
        return this.error.message;
    }

    @api
    getErrorWCStack() {
        return this.error.wcStack;
    }

    errorCallback(error) {
        this.error = error;
    }
}
