import { LightningElement, wire } from 'lwc';
import { adapter } from './adapter';
const sym = Symbol('computed prop');

export default class Wire extends LightningElement {
    @wire(adapter, { name: 'symbol' })
    [sym]() {
        return 'john was here';
    }

    get exposedSymbol() {
        return this[sym]();
    }
}
