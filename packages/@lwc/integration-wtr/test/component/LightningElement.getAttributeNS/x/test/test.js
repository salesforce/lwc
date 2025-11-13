import { LightningElement, api } from 'lwc';

export default class GetAttributeNS extends LightningElement {
    @api
    getComponentAttributeNS(...args) {
        return this.getAttributeNS(...args);
    }
}
