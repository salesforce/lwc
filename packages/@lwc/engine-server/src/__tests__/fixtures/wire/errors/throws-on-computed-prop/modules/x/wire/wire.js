import { LightningElement, wire } from 'lwc';
import { adapter } from './adapter';
const sym = Symbol('computed prop');

export default class Wire extends LightningElement {
    @wire(adapter, { name: 'symbol' })
    get [sym]() {
        throw new Error('getter should not be called');
    }

    get exposedSymbol() {
        return this[sym];
    }
}
