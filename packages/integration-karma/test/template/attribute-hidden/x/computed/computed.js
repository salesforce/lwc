import { LightningElement, api } from 'lwc';

export default class Computed extends LightningElement {
    hiddenValue = false;

    @api
    toggleHiddenValue() {
        this.hiddenValue = !this.hiddenValue;
    }
}
