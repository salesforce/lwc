import { api, LightningElement } from 'lwc';

export default class Component extends LightningElement {
    @api remaining = 9;
    @api label = 'default';

    get someChildren() {
        return ['a', 'b', 'c'];
    }

    get isPositive() {
        return this.remaining > 0;
    }

    get isDivisibleByThree() {
        return this.remaining % 3 === 0;
    }

    get isDivisibleByTwo() {
        return this.remaining % 3 === 0;
    }

    get minusOne() {
        return this.remaining - 1;
    }
}
