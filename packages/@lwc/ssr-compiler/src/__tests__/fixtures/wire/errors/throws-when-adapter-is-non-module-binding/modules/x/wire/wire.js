import { wire, LightningElement } from 'lwc';
const getFoo = () => null;
export default class Test extends LightningElement {
    @wire(getFoo)
    wiredFoo;
}
