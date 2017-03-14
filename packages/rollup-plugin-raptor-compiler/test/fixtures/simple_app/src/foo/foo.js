import { HTMLElement } from "raptor";
import html from "./foo.html";

export default class Foo extends HTMLElement {
    render() {
        return html;
    }
}
