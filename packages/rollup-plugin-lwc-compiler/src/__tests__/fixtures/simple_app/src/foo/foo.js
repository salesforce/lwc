import { api, LightningElement } from "lwc";
import html from "./foo.html";

export default class Foo extends LightningElement {
    @api x;
    render() {
        return html;
    }
}
