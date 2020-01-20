import { LightningElement, api, track } from 'lwc';

export default class NonString extends LightningElement {
    @track arr = [];

    @api
    push(value) {
        this.arr.push(value);
    }
}
