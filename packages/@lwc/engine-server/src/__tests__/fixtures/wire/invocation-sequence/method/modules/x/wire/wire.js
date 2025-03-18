import { LightningElement, wire } from 'lwc';

import { adapter, invocationSequence } from './adapter';

export default class Wire extends LightningElement {
    prop = 'foo';

    @wire(adapter, { key1: '$prop' })
    wiredMethod(value) {
        invocationSequence.push('component wiredMethod()');
        this.externalProp = value;
    }

    get invocationSequence() {
        return invocationSequence.map((invocation, i) => `\n ${i + 1}. ${invocation}`).join('');
    }
}
