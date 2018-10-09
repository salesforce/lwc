import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api
    select(sel) {
        return this.querySelector(sel);
    }
}
