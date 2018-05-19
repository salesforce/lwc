define('myns-relative_import', ['engine'], function (engine) {

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {
      key: 1
  }, [])];
}

if (style) {
    tmpl.token = 'myns-relative_import_relative_import';

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'myns-relative_import_relative_import';
    style$$1.textContent = style('myns-relative_import', 'myns-relative_import_relative_import');
    document.head.appendChild(style$$1);
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
