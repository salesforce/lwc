import { api, LightningElement } from 'lwc';

export default class App extends LightningElement {
    // eslint-disable-next-line no-useless-computed-key
    ['with spaces'] = 'spaces!';
    // eslint-disable-next-line no-useless-computed-key
    [1337] = 'number!';

    get spaces() {
        return this['with spaces'];
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
