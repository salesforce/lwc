import { LightningElement, api } from 'lwc';
import Z from 'base/libraryz';

export default class Container extends LightningElement {
    @api
    testValue;
    connectedCallback() {
        this.testValue = new Z().value;
    }
}
