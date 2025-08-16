import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api label;

    counter = 0;

    increment() {
        this.counter++;
    }
    decrement() {
        this.counter--;
        this.#something();
    }
    #something() {
        // eslint-disable-next-line no-console
        console.log(`Private`);
    }
}
