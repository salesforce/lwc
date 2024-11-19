import { LightningElement, wire } from 'lwc';

import { adapter, isAdapterInvoked } from './adapter';

export default class Wire extends LightningElement {
    @wire(adapter)
    wiredProp;

    get isAdapterInvoked() {
        return isAdapterInvoked;
    }
}