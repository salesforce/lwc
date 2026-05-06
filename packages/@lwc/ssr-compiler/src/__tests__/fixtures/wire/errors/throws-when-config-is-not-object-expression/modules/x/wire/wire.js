import { wire, LightningElement } from 'lwc';
import { Adapter } from 'x/adapter';
export default class Test extends LightningElement {
    @wire(Adapter, 42)
    wiredFoo;
}
