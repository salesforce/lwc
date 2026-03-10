import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #helper() {
        return 42;
    }
    #caller() {
        return this.#helper() + 1;
    }
}
