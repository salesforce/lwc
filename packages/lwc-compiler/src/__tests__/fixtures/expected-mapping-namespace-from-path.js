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
    tmpl.token = 'x-cmp1_cmp1';

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-cmp1_cmp1';
    style$$1.textContent = style('x-cmp1', 'x-cmp1_cmp1');
    document.head.appendChild(style$$1);
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
