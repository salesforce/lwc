import { LightningElement, api, track } from 'lwc';

let count = 0;

export default class extends LightningElement {
    @track
    rows = [];

    @api
    addRow() {
        this.rows.push(++count);
    }
}
