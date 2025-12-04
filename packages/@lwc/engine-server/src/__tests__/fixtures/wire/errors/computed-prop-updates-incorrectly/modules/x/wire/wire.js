import { LightningElement, wire } from 'lwc';
import { adapter } from './adapter';

const symbol = Symbol("I'm a symbol!");
export default class extends LightningElement {
    symbol = 'accidentally overwritten';

    @wire(adapter, { value: 'wire data' })
    [symbol] = 'unset';

    get symbolValue() {
        return this[symbol] ?? 'unset';
    }
}
