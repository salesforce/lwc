import { Element } from 'engine';

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
    const tagName = 'x-foo';
    const token = 'x-foo_foo';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
}

const Test = 1;
class ClassAndTemplate extends Element {
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

export default ClassAndTemplate;
