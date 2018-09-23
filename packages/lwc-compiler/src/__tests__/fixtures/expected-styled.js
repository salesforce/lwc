import _xFoo from 'x/foo';
import { LightningElement } from 'lwc';

var stylesheet = {
    hostToken: 'styled-x-c715c-host',
    shadowToken: 'styled-x-c715c',
    content: `[styled-x-c715c-host] {
        color: blue;
        }
        div[styled-x-c715c] {
        color: red;
        }
        x-foo[styled-x-c715c],[is="x-foo"][styled-x-c715c] {
        color: green;
        }
        `,
};


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

if (stylesheet) {
    tmpl.hostToken = stylesheet.hostToken;
    tmpl.shadowToken = stylesheet.shadowToken;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.dataset.token = stylesheet.shadowToken;
    style.textContent = stylesheet.content;
    document.head.appendChild(style);
}

class Styled extends LightningElement {
  render() {
    return tmpl;
  }

}

export default Styled;
