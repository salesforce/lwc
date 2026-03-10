import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #handler() { return 42; }
    connectedCallback() {
        const fn = this.#handler;
        setTimeout(this.#handler, 100);
    }
}
