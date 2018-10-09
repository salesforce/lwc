import { LightningElement, api } from 'lwc';

export default class IntTabSet extends LightningElement {
    @api getRegistered() {
        return this.root.querySelector('integration-fulltabset').getRegistered();
    }
}
