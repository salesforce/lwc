define('x-foo', ['lwc'], function (lwc) {

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
    tmpl.hostToken = 'x-foo_foo-host';
    tmpl.shadowToken = 'x-foo_foo';

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-foo_foo';
    style$$1.textContent = style('x-foo_foo');
    document.head.appendChild(style$$1);
}

const Test = 1;
class ClassAndTemplate extends lwc.LightningElement {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }

    render() {
        return tmpl;
    }

}

return ClassAndTemplate;

});
