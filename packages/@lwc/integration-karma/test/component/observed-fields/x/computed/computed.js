import { api, LightningElement } from 'lwc';

const SYMBOL = Symbol('haha');

export default class App extends LightningElement {
    static symbol = SYMBOL;
    // eslint-disable-next-line no-useless-computed-key
    ['with spaces'] = 'spaces!';
    // eslint-disable-next-line no-useless-computed-key
    [1337] = 'number!';
    [SYMBOL] = 'symbol!';

    get spaces() {
        return this['with spaces'];
    }

    get number() {
        return this[1337];
    }

    get symbol() {
        return this[SYMBOL];
    }

    @api setValue(field, value) {
        this[field] = value;
    }

    @api getValue(field) {
        return this[field];
    }
}
