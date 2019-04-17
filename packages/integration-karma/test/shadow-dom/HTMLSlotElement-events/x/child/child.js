import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    count = 0;

    @api
    getCount() {
        return this.count;
    }

    @api
    setCount(value) {
        this.count = value;
    }

    handleSlotChange() {
        this.count += 1;
    }
}
