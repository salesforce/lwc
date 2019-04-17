import { LightningElement, api, track } from 'lwc';

export default class Parent extends LightningElement {
    @track
    items = [0];

    @api
    add() {
        const { items } = this;
        const last = items[items.length - 1];
        items.push(last + 1);
    }

    @api
    replace() {
        this.items = [777];
    }

    @api
    clear() {
        this.items = [];
    }

    count = 0;

    @api
    getCount() {
        return this.count;
    }

    @api
    setCount(value) {
        this.count = value;
    }

    connectedCallback() {
        this.template.addEventListener('slotchange', () => {
            this.count += 1;
        });
    }
}
