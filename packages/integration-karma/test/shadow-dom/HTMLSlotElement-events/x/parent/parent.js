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

    _slotChangeCount = 0;

    @api
    get slotChangeCount() {
        return this._slotChangeCount;
    }
    set slotChangeCount(value) {
        this._slotChangeCount = value;
    }

    connectedCallback() {
        this.template.addEventListener('slotchange', () => {
            this._slotChangeCount += 1;
        });
    }
}
