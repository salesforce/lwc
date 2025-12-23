import { wire, LightningElement } from 'lwc';
import WireAdapter from 'x/adapter';
export default class Test extends LightningElement {
    @wire(WireAdapter, { key1: '$prop1', key2: ['fixed', 'array'] })
    // Accidentally static 💣
    static wiredMethod(value) {
        this.externalProp = value;
    }

    prop1 = 'foo';
    externalProp;
}
