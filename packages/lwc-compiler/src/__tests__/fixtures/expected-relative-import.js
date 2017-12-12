define('myns-relative_import', ['engine'], function (engine) {

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {}, [])];
}

if (style) {
    const tagName = 'myns-relative_import';
    const token = 'myns-relative_import_relative_import';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
}

function test() {}

function sibling() {}

function inner() {
    return sibling();
}

class RelativeImport extends engine.Element {
    constructor() {
        super();
        this.x = test();
        this.y = inner();
    }

    render() {
        return tmpl;
    }

}
RelativeImport.style = tmpl.style;

return RelativeImport;

});
