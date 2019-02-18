import { LightningElement, api } from 'lwc';

export default class RecordLayoutItem extends LightningElement {
    @api mode;
    @api fieldLabel;
    @api fieldApiName;
    @api isInlineEditable = false;
    set role(value) {
        this.setAttribute('role', value);
    }
    @api get role() {
        return this.getAttribute('role');
    }
}
