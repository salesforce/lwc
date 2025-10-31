import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api caughtError = null;
    errorCallback(err) {
        this.caughtError = err.message;
    }
}
