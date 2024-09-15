import { api, LightningElement } from 'lwc';

const symbol = Symbol('haha');

export default class App extends LightningElement {
    static symbol = symbol;
    // eslint-disable-next-line no-useless-computed-key
    ['with spaces'] = 'spaces!';
    // eslint-disable-next-line no-useless-computed-key
    [1337] = 'number!';
    [symbol] = 'symbol!';

    get spaces() {
        return this['with spaces'];
    }

    get number() {
        return this[1337];
    }

    get symbol() {
        return this[symbol];
    }

    @api setValue(field, value) {
        this[field] = value;
    }

    @api getValue(field) {
        return this[field];
    }
}
