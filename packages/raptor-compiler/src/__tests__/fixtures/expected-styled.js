import _xFoo from 'x-foo';
import { Element } from 'engine';

const style = `x-styled[x-styled_styled],[is="x-styled"][x-styled_styled] {
    color: blue;
}

div[x-styled_styled] {
    color: red;
}

x-foo[x-styled_styled],[is="x-foo"][x-styled_styled] {
    color: green;
}
`;
const token = 'x-styled_styled';

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    c: api_custom_element
  } = $api;

  return [api_element("div", {
    attrs: {
      [token]: true
    }
  }, []), api_custom_element("x-foo", _xFoo, {
    attrs: {
      [token]: true
    }
  })];
}
tmpl.style = style;
tmpl.token = token;

class Styled extends Element {
  render() {
    return tmpl;
  }

}
Styled.style = tmpl.style;

export default Styled;
