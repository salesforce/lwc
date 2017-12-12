define('x-class_and_template', ['engine'], function (engine) {

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {}, [])];
}

if (style) {
    const tagName = 'x-class_and_template';
    const token = 'x-class_and_template_class_and_template';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
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
ClassAndTemplate.style = tmpl.style;

return ClassAndTemplate;

});
