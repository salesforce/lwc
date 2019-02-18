import { LightningElement, api } from 'lwc';

export default class NestedSlots extends LightningElement {
    @api getRegisteredTabs() {
        return this.template.querySelector('integration-tabset').getRegistered();
    }
}
