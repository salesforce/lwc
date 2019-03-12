import { LightningElement, api } from 'lwc';

export default class ShadowRootGetter extends LightningElement {
    @api
    getShadowRoot() {
        return this.template;
    }
}
