import { LightningElement, wire } from 'lwc';
import { adapter } from './adapter';
const sym = Symbol('computed prop');

export default class Wire extends LightningElement {
    @wire(adapter, { name: 'symbol' })
    get [sym]() {
        throw new Error('get bothDecorated should not be called');
    }

    @wire(adapter, { name: 'symbol' })
    set [sym](v) {
        throw new Error('set bothDecorated should not be called');
    }

    get exposedSymbol() {
        return this[sym];
    }
}
