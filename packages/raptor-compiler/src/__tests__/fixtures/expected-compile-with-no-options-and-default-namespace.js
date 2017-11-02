import { Element } from 'engine';

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {}, [])];
}

if (style) {
    const tagName = 'x-default';
    const token = 'x-default_default';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
}

class Default extends Element {
  render() {
    return tmpl;
  }

}
Default.style = tmpl.style;

export default Default;
