import { LightningElement } from "lwc";

export default class App extends LightningElement {
    list;

    constructor() {
        super();
        this.list = [];
    }
}
