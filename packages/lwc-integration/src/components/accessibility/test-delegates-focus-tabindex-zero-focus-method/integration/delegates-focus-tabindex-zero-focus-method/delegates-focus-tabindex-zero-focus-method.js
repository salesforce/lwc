import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api
    focusInput() {
        this.template.querySelector('integration-child').focus();
    }
}
