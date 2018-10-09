import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    select(sel) {
        return this.querySelector(sel);
    }
}
