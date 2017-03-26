$A.componentService.addModule('myns:relative_import', function () { 'use strict';

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

function test() {}

function sibling() {}

function inner() {
    return sibling();
}

class RelativeImport {
    constructor() {
        this.x = test();
        this.y = inner();
    }

    render() {
        return _tmpl;
    }

}
RelativeImport.tagName = 'myns-relative_import';
RelativeImport.templateUsedIds = templateUsedIds;

return RelativeImport;

});
