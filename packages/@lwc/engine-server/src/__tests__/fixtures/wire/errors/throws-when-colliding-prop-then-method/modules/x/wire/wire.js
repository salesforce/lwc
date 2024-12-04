import { wire, LightningElement } from 'lwc';
import { Adapter } from 'x/adapter';
export default class Test extends LightningElement {
    methodUsed = false;

    @wire(Adapter, { key1: '$prop1', key2: ['fixed', 'array'] })
    wired;

    @wire(Adapter, { key1: '$prop1', key2: ['fixed', 'array'] })
    wired(val) {
        this.methodUsed = val;
    }
}
