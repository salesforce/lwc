define('x-class_and_template', ['lwc'], function (lwc) {

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
    tmpl.stylesheet = style;
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
