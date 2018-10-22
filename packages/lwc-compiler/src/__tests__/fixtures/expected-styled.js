import _xFoo from 'x/foo';
import { registerTemplate, LightningElement } from 'lwc';

function factory(hostSelector, shadowSelector) {
    return `:host {
    color: blue;
}

${hostSelector} {
    color: blue;
}
div${shadowSelector} {
    color: red;
}
x-foo${shadowSelector} {
    color: green;
}
    `;
}

var stylesheet = {
    factory,
    hostAttribute: 'x-styled_styled-host',
    shadowAttribute: 'x-styled_styled',
};

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    c: api_custom_element
  } = $api;

  return [api_element("div", {
        key: 2,
        create: () => {},
        update: () => {}
    }, []), api_custom_element("x-foo", _xFoo, {
        key: 3,
        create: () => {},
        update: () => {}
    }, [])];
}

var _tmpl = registerTemplate(tmpl);

if (stylesheet) {
    tmpl.stylesheet = stylesheet;
}

class Styled extends LightningElement {
  render() {
    return _tmpl;
  }

}

export default Styled;
