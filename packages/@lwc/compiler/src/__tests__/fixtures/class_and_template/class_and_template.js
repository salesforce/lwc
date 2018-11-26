import { LightningElement } from "lwc";
const Test = 1;
export default class ClassAndTemplate extends LightningElement {
    t = Test;
    constructor() {
        super();
        this.counter = 0;
    }
}
