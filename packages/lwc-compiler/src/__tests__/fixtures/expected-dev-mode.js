define('x-class_and_template', ['engine'], function (engine) {

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
    tmpl.hostToken = 'x-class_and_template_class_and_template-host';
    tmpl.shadowToken = 'x-class_and_template_class_and_template';

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-class_and_template_class_and_template';
    style$$1.textContent = style('x-class_and_template_class_and_template');
    document.head.appendChild(style$$1);
}

const Test = 1;
class ClassAndTemplate extends engine.Element {
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
