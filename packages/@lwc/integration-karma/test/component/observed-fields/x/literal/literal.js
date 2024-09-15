import { api, LightningElement } from 'lwc';

export default class App extends LightningElement {
    reg = 'string!';
    1337 = 'number!';

    get string() {
        return this['reg'];
    }

    get number() {
        return this[1337];
    }

    @api setValue(field, value) {
        this[field] = value;
    }

    @api getValue(field) {
        return this[field];
    }
}
