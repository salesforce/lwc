import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
    test = 1;
    constructor() {
        super();
    }
    test() {}

    render() {
        return _tmpl;
    }

}
