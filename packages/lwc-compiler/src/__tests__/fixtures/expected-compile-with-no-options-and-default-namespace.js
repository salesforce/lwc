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
    tmpl.hostToken = 'x-default_default-host';
    tmpl.shadowToken = 'x-default_default';

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-default_default';
    style$$1.textContent = style('x-default', 'x-default_default');
    document.head.appendChild(style$$1);
}

class Default extends Element {
  render() {
    return tmpl;
  }

}
Default.style = tmpl.style;

export default Default;
