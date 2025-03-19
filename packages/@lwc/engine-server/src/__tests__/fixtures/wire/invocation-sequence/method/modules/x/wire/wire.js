import { LightningElement, wire, api } from 'lwc';

import { adapter, invocationSequence } from './adapter';

export default class Wire extends LightningElement {
    @api
    set apiValue(value) {
        invocationSequence.push(`component: setApiValue(${value})`);
        this._apiValue = value;
    }

    get apiValue() {
        invocationSequence.push(`component: getApiValue(${this._apiValue})`);
        return this._apiValue;
    }

    @wire(adapter, { apiValue: '$apiValue' })
    wiredMethod(value) {
        invocationSequence.push(`component: wiredMethod(${value})`);
        this.apiValue = value;
    }

    get invocationSequence() {
        return invocationSequence.map((invocation, i) => `\n ${i + 1}. ${invocation}`).join('');
    }
}
