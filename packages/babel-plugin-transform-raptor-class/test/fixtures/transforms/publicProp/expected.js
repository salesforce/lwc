import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
    test = 1;
    string = "some value";

    foo() {}

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    test: {
        config: 0,
        type: "number"
    },
    string: {
        config: 0,
        type: "string"
    }
};
