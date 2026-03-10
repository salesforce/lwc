import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #recursive(n) {
        if (n <= 0) return 0;
        return n + this.#recursive(n - 1);
    }
}
