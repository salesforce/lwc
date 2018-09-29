import { LightningElement } from "lwc";
import html from "./app.html";

export default class App extends LightningElement {
    constructor() {
        super();
        this.list = [];
    }
    render() {
        return html;
    }
}
