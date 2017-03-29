$A.componentService.addModule('myns:relative_import', function () { 'use strict';

function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        []
    )];
}

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
        return tmpl;
    }

}

return RelativeImport;

});
