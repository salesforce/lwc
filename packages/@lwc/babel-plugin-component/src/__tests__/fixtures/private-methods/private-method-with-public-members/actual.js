import { LightningElement, api } from 'lwc';
export default class Test extends LightningElement {
    @api label = 'default';
    count = 0;

    #increment() {
        this.count++;
    }

    handleClick() {
        this.#increment();
    }
}
