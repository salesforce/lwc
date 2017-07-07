import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
    publicSetter = "some value";
    set publicSetter(value) {
        this.thing = value;
    }

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    publicSetter: {
        config: 2,
        type: "string"
    }
};
