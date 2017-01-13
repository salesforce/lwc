import { usedIdentifiers as _t } from "./actual.html";
import _tmpl from "./actual.html";
export default class Test {

    constructor() {}

    test() {}

    render(p) {
        return _tmpl.call(this, p);
    }

}
Test.tagName = "unknown-test";
Test.publicProps = {
    test: 1,
    bar: null
};
Test.templateUsedProps = _t;