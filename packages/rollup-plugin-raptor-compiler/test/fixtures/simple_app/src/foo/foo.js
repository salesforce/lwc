import { Element } from "engine";
import html from "./foo.html";

export default class Foo extends Element {
    render() {
        return html;
    }
}
