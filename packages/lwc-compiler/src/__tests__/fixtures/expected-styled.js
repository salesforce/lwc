import _xFoo from 'x/foo';
import { LightningElement } from 'lwc';

function style(token) {
    return `:host {
    color: blue;
}

[${token}-host] {
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
    tmpl.hostToken = 'x-styled_styled-host';
    tmpl.shadowToken = 'x-styled_styled';
    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-styled_styled';
    style$$1.textContent = style('x-styled_styled');
    document.head.appendChild(style$$1);
}

class Styled extends LightningElement {
  render() {
    return tmpl;
  }

}

export default Styled;
