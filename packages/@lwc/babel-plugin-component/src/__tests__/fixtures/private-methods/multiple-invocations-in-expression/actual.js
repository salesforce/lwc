import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #compute(x) {
        return x * 2;
    }
    #getValue() {
        return 10;
    }
    calculate() {
        const sum = this.#compute(5) + this.#compute(10);
        const combined = this.#getValue() + this.#compute(this.#getValue());
        return sum + combined;
    }
}
