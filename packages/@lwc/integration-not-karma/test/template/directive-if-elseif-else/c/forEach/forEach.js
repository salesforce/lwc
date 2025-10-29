import { LightningElement, api, track } from 'lwc';

export default class ForEach extends LightningElement {
    @api showList = false;
    @track items = [
        { value: 1, show: true },
        { value: 2, show: true },
        { value: 3, show: true },
    ];

    @api
    appendToList(value) {
        this.items.push(value);
    }

    @api
    prependToList(value) {
        this.items.splice(0, 0, value);
    }

    @api
    hide(value) {
        this.find(value).show = false;
    }

    @api
    show(value) {
        this.find(value).show = true;
    }

    find(value) {
        return this.items.find((item) => item.value === value);
    }
}
