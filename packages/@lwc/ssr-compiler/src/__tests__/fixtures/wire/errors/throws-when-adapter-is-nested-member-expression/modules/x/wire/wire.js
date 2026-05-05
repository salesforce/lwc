import { wire, LightningElement } from 'lwc';
import { adapters } from 'x/adapter';
export default class Test extends LightningElement {
    @wire(adapters.getters.getFoo)
    wiredFoo;
}
