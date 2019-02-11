import { LightningElement, api } from 'lwc';

export default class PublicMethods extends LightningElement {
    @api
    get getterOnly() {
        return 'getterOnly';
    }

    @api
    get getterAndSetter() {
        return 'getterAndSetter';
    }
    set getterAndSetter(v) {}
}
