import { LightningElement, api } from 'lwc';

export default class IntTabSet extends LightningElement {
    @api getRegistered() {
        return this.template.querySelector('integration-fulltabset').getRegistered();
    }
}
