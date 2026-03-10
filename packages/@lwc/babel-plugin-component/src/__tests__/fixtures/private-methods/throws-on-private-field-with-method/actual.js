import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #count = 0;
    #increment() {
        this.#count++;
    }
}
