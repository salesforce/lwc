import { Element } from 'engine';

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    h: api_element
  } = $api;

  return [api_element("p", {
      key: 1
  }, [api_text("CMP1")])];
}

if (style) {
    const tagName = 'x-cmp1';
    const token = 'x-cmp1_cmp1';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
}

class Cmp1 extends Element {
    constructor() {
        super();
    }

    render() {
        return tmpl;
    }

}
Cmp1.style = tmpl.style;

export default Cmp1;
