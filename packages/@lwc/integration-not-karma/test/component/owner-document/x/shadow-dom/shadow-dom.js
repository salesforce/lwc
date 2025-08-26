import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    @api
    getOwnerDocument() {
        return this.ownerDocument;
    }
}
