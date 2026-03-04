import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #privateHelper() {
        return 42;
    }
    connectedCallback() {
        const val = this.#privateHelper();
        console.log(val);
    }
}
