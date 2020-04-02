import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api
    error;

    errorCallback(error) {
        this.error = error;
    }
}
