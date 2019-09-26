import { LightningElement } from "lwc";

export default class App extends LightningElement {
    private list;

    constructor() {
        super();
        this.list = [];
    }
}
