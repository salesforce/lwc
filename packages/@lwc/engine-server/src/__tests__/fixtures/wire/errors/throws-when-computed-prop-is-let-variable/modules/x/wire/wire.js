import { wire, LightningElement } from 'lwc';
import { Adapter } from 'x/adapter';
let key1 = 'key1';
export default class Test extends LightningElement {
    @wire(Adapter, { [key1]: '$prop1', key2: ['fixed', 'array'] })
    wiredFoo;
}
