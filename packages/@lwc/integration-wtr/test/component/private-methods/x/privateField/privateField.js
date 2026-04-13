import { LightningElement, api } from 'lwc';

export default class PrivateField extends LightningElement {
    #count = 0;

    @api
    increment() {
        this.#count++;
    }

    @api
    getCount() {
        return this.#count;
    }
}
