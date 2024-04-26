import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api label: string | undefined;

    counter = 0;

    increment() {
        this.counter++;
    }
    decrement() {
        this.counter--;
    }
}
