import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api items = [null, 2, null, 4];

    get firstItem() {
        return this.items[0];
    }

    get secondItem() {
        return this.items[1];
    }

    get thirdItem() {
        return this.items[2];
    }

    get fourthItem() {
        return this.items[3];
    }
}
