define('myns-relative_import', function () {

function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h("section", {}, [])];
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
