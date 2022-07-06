import { LightningElement } from "lwc";

export default class extends LightningElement {
    counter = 0;

    increment() {
        this.counter++;
    }
    decrement() {
        this.counter--;
    }
}
