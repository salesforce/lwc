import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    selectAll(sel) {
        return this.querySelectorAll(sel);
    }
}
