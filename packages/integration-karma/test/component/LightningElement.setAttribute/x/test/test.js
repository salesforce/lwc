import { LightningElement, api } from 'lwc';

export default class SetAttribute extends LightningElement {
    @api
    setComponentAttribute(...args) {
        return this.setAttribute(...args);
    }
}
