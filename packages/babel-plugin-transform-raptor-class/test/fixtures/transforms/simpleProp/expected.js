import { templateUsedIds as _t } from "./actual.html";
import _tmpl from "./actual.html";
export default class Test {
    test = 1;
    constructor() {}
    test() {}

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    test: 1
};
Test.templateUsedIds = _t;
