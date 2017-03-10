$A.componentService.addModule('myns:classandtemplate', function () { 'use strict';

const memoized = Symbol();
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
ClassAndTemplate.tagName = "myns-classandtemplate";
ClassAndTemplate.publicProps = {
    t: Test
};
ClassAndTemplate.templateUsedIds = templateUsedIds;

return ClassAndTemplate;

});
