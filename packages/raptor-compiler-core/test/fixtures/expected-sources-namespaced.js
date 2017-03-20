const memoized = Symbol('memoize');
var _tmpl = function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        []
    )];
};
const templateUsedIds = [];

const Test = 1;
class ClassAndTemplate {
    constructor() {
        this.counter = 0;
    }

    render() {
        return _tmpl;
    }

}
ClassAndTemplate.tagName = "customns-class_and_template";
ClassAndTemplate.publicProps = {
    t: Test
};
ClassAndTemplate.templateUsedIds = templateUsedIds;

export default ClassAndTemplate;
