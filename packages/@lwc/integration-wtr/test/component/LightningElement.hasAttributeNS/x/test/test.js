import { LightningElement, api } from 'lwc';

export default class HasAttributeNS extends LightningElement {
    @api
    hasComponentAttributeNS(...args) {
        return this.hasAttributeNS(...args);
    }
}
