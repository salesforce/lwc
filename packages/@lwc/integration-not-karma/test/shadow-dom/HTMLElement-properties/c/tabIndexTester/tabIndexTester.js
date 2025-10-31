import { LightningElement, api } from 'lwc';

export default class MyComponent extends LightningElement {
    @api
    tabIndexInConnectedCallback;

    connectedCallback() {
        this.tabIndexInConnectedCallback = this.tabIndex;
    }

    @api
    getTabIndex() {
        return this.tabIndex;
    }
}
