import { LightningElement, api, track } from 'lwc';

export default class extends LightningElement {
    @track items = [0];

    @api add() {
        this.items.push(this.items.length);
    }

    @api delete() {
        this.items.pop();
    }
}
