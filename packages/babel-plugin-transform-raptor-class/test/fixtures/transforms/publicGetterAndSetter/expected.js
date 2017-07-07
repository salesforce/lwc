import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
    get something() {
        return this.s;
    }

    set something(value) {
        this.s = value;
    }

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    something: {
        config: 3
    }
};
