import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api count = 0;

    get isOdd() {
        return this.count % 2 === 1;
    }

    get comments() {
        const result = [];

        for (let i = 0; i < this.count; i++) {
            result.push(i);
        }

        return result;
    }
}
