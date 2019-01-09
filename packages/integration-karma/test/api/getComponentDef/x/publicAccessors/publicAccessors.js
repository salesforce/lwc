import { LightningElement, api } from 'lwc';

export default class PublicMethods extends LightningElement {
    @api
    get getterOnly() {}

    @api
    get getterAndSetter() {}
    set getterAndSetter(v) {}
}
