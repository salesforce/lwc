import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api label;

    counter = 0;

    increment() {
        this.counter++;
    }
    decrement() {
        this.counter--;
        // eslint-disable-next-line no-console
        this.#something().then(console.log);
    }

    async #something() {
        return 'I am async';
    }
}
