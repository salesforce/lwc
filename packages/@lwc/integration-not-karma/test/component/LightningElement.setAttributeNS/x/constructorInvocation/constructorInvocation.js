import { LightningElement } from 'lwc';

export default class ConstructorInvocation extends LightningElement {
    constructor() {
        super();
        this.setAttributeNS('http://www.salesforce.com/2019/lwc', 'foo', 'bar');
    }
}
