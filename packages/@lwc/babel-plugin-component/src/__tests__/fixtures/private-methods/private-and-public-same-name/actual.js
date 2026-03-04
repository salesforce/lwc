import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #foo() { return 'private'; }
    foo() { return 'public'; }
}
