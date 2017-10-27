import { Element } from 'engine';

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    h: api_element
  } = $api;

  return [api_element("p", {}, [api_text("CMP1")])];
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
