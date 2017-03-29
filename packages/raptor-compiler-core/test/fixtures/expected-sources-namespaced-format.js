$A.componentService.addModule('myns:class_and_template', function () { 'use strict';

function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        []
    )];
}

const Test = 1;
class ClassAndTemplate {
    constructor() {
        this.t = Test;

        this.counter = 0;
    }

    render() {
        return tmpl;
    }

}
ClassAndTemplate.publicProps = {
    t: Test
};

return ClassAndTemplate;

});
