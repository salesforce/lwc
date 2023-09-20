import { LightningElement, api } from 'lwc';

export default class PrivateAccessors extends LightningElement {
    get privateGetter() {
        return 'private getter';
    }

    @api
    get publicGetter() {
        return 'publicGetter';
    }
}
