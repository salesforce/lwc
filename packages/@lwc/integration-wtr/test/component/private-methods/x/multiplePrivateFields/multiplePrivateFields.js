import { LightningElement, api } from 'lwc';

export default class MultiplePrivateFields extends LightningElement {
    #payload;
    #cache = new Map();
    #isDirty = false;

    constructor() {
        super();
        this.#payload = {};
    }

    @api
    setData(data) {
        this.#payload = data;
        this.#isDirty = true;
        this.#cache.set('data', data);
    }

    @api
    getData() {
        return this.#payload;
    }

    @api
    isDirty() {
        return this.#isDirty;
    }
}
