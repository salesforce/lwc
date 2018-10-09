import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api
    selectAll(sel) {
        return this.querySelectorAll(sel);
    }
}
