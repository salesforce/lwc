import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    focus() {
        this.template.querySelector('input').focus();
    }
}
