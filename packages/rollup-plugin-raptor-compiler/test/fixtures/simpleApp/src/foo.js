import { HTMLElement } from "raptor";
import html from "./foo.html";

export default class foo extends HTMLElement {
    x;

    render() {
        return html;
    }
}
