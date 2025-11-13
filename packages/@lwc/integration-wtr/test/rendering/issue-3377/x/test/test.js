import { LightningElement, api, track } from 'lwc';

export default class CustomRender extends LightningElement {
    @track
    items = [];

    @api
    addItem() {
        this.items.push(this.counter++);
    }

    counter = 0;
}
