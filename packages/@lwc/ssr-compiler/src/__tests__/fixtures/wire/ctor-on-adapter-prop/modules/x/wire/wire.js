import { LightningElement, wire } from 'lwc';

import { arrowFnWithAdapter, isAdapterInvoked } from './adapter';

export default class Wire extends LightningElement {
    @wire(arrowFnWithAdapter)
    wiredProp;

    get isAdapterInvoked() {
        return isAdapterInvoked;
    }
}
