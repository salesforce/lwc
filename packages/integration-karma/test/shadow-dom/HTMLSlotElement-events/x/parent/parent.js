import { LightningElement, api, track } from 'lwc';

export default class Parent extends LightningElement {
    @track
    items = [0];

    @api
    customLastName = false;

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

    @api
    customizeLastName(name) {
        this.customLastName = name;
    }

    @api
    slotChangeCount = 0;

    handleSlotChange() {
        this.slotChangeCount += 1;
    }

    connectedCallback() {
        this.template.addEventListener('slotchange', this.handleSlotChange);
    }
}
