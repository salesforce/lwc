import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
    get publicGetter() {
        return 1;
    }

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    publicGetter: {
        config: 1
    }
};
