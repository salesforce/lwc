import { LightningElement, api, track } from 'lwc';

export default class Parent extends LightningElement {
    @track
    items = ['foo'];

    @api
    add() {
        this.items.push('bar');
    }

    @api
    replace() {
        this.items = ['baz'];
    }

    @api
    clear() {
        this.items = [];
    }

    slotChangeCount = 0;

    @api
    getSlotChangeCount() {
        return this.slotChangeCount;
    }

    @api
    setSlotChangeCount(value) {
        this.slotChangeCount = value;
    }

    connectedCallback() {
        this.template.addEventListener('slotchange', () => {
            this.slotChangeCount += 1;
        });
    }
}
