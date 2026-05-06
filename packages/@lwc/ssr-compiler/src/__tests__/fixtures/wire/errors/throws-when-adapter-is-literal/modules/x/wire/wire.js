import { wire, LightningElement } from 'lwc';
export default class Test extends LightningElement {
    @wire('not-an-identifier')
    wiredFoo;
}
