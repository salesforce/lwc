import { LightningElement, wire } from 'lwc';
import { adapter } from './adapter';
const sym = Symbol('computed prop');

export default class Wire extends LightningElement {
    @wire(adapter, { name: 'symbol' })
    set [sym](_) {
        throw new Error('setter should not be called');
    }

    get exposedSymbol() {
        this[sym] = 123;
        return 123;
    }
}
