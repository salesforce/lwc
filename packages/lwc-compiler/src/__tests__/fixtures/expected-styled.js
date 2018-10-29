import _xFoo from 'x/foo';
import { registerTemplate, LightningElement } from 'lwc';

function stylesheet(hostSelector, shadowSelector, nativeShadow) {
    return `
${nativeShadow ? (":host {color: blue;}") : (hostSelector + " {color: blue;}")}
div${shadowSelector} {color: red;}
x-foo${shadowSelector} {color: green;}
    `;
}

var stylesheets = [stylesheet];

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    c: api_custom_element
  } = $api;

  return [api_element("div", {
        key: 2
    }, []), api_custom_element("x-foo", _xFoo, {
        key: 3
    }, [])];
}

var _tmpl = registerTemplate(tmpl);

if (stylesheets) {
    tmpl.stylesheets = {
        stylesheets,
        hostAttribute: "x-styled_styled-host",
        shadowAttribute: "x-styled_styled"
    };
}

class Styled extends LightningElement {
  render() {
    return _tmpl;
  }

}

export default Styled;
