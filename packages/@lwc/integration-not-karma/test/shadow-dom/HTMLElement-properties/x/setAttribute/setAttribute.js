import { LightningElement, api } from 'lwc';

export default class MyComponent extends LightningElement {
    @api
    userDefinedTabIndexValue;

    renderedCallback() {
        this.userDefinedTabIndexValue = this.getAttribute('tabindex');
    }
}
