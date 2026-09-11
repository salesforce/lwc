import { LightningElement, api, track } from 'lwc';

export default class Counter extends LightningElement {
    @api startLabel = 'Count';
    @track count = 0;

    get label() {
        return `${this.startLabel}: ${this.count}`;
    }

    increment() {
        this.count++;
    }
}
