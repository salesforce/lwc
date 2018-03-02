import { api, Element } from "engine";
import html from "./foo.html";

export default class Foo extends Element {
    @api x;
    render() {
        return html;
    }
}
