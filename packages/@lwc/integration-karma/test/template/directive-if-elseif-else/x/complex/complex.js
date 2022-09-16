import { LightningElement, api, track } from 'lwc';

export default class Complex extends LightningElement {
    @api showNestedContent = false;
    @api showList = false;
    @track items = [1, 2, 3];

    @api
    refreshList() {
        this.items.push(this.items.length + 1);
    }
}
