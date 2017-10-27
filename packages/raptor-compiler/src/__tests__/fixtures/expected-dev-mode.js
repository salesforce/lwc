define('x-class_and_template', ['engine'], function (engine) {

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {}, [])];
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
