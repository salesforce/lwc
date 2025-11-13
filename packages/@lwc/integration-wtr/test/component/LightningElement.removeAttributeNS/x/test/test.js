import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api
    removeComponentAttributeNS(...args) {
        return this.removeAttributeNS(...args);
    }
}
