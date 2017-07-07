import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
    set publicSetter(value) {
        this.thing = value;
    }

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    publicSetter: {
        config: 2
    }
};
