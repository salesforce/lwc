import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #helper() {
        return 42;
    }
    connectedCallback() {
        setTimeout(() => {
            const result = this.#helper();
            console.log(result);
        }, 100);

        Promise.resolve().then(() => this.#helper());
    }
}
