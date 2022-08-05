import { LightningElement, api, track } from 'lwc';

export default class Test extends LightningElement {
    counter = 0;
    @track items = [1, 2, 3];
    @track city = 'miami';
    @api addNewItem(item) {
        this.items.push(item);
    }
    @api getRenderingCounter() {
        return this.counter;
    }
    @api setCity(v) {
        return (this.city = v);
    }
    renderedCallback() {
        this.counter++;
    }
}
