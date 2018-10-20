import { LightningElement } from 'lwc';

export default class DelegatesFocus extends LightningElement {
    connectedCallback() {
        this.template.host.tabIndex = 0;
    }
}
