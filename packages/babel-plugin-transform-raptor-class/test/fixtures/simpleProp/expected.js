import { templateUsedIds as _t } from "./actual.html";
import _tmpl from "./actual.html";
export default class Test {
    constructor() {}
    test() {}

    render() {
        return _tmpl;
    }

}
Test.tagName = "unknown-test";
Test.publicProps = {
    test: 1
};
Test.templateUsedIds = _t;
