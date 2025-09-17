import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api
    setComponentAttributeNS(...args) {
        return this.setAttributeNS(...args);
    }
}
