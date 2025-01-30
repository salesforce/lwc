import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api set setterGetterApi(value) {
        this._someApi = value;
    }

    get setterGetterApi() {
        return this._someApi;
    }
}
