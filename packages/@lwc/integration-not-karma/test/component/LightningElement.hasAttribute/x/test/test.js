import { LightningElement, api } from 'lwc';

export default class HasAttribute extends LightningElement {
    @api
    hasComponentAttribute(...args) {
        return this.hasAttribute(...args);
    }
}
