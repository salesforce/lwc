import _xFoo from 'x-foo';
import { Element } from 'engine';

function style(tagName, token) {
    return `${tagName}[${token}],[is="${tagName}"][${token}] {
    color: blue;
}

div[${token}] {
    color: red;
}

x-foo[${token}],[is="x-foo"][${token}] {
    color: green;
}
    `;
}

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    c: api_custom_element
  } = $api;

  return [api_element("div", {
        key: 1
    }, []), api_custom_element("x-foo", _xFoo, {
        key: 2
    }, [])];
}

if (style) {
    const tagName = 'x-styled';
    const token = 'x-styled_styled';

    tmpl.token = token;
    tmpl.style = style(tagName, token);
}

class Styled extends Element {
  render() {
    return tmpl;
  }

}
Styled.style = tmpl.style;

export default Styled;
