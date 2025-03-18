import { LightningElement, wire } from 'lwc';

import { adapter, invocationSequence } from './adapter';

export default class Wire extends LightningElement {
    @wire(adapter)
    wiredProp;

    get invocationSequence() {
        return invocationSequence.map((invocation, i) => `${i + 1}. ${invocation}`).join(' ');
    }
}
