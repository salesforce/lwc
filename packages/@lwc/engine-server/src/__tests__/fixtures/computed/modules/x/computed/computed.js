import { LightningElement, api } from 'lwc';

export default class Computed extends LightningElement {
    @api a;
    @api b;

    get c() {
        return this.a + this.b;
    }
}