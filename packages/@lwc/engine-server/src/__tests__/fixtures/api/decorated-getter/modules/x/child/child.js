import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    set setterGetterApi(value) {
        this._someApi = value;
    }

    @api
    get setterGetterApi() {
        return this._someApi;
    }
}
