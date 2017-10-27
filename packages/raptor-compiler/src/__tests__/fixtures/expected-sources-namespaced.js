import { Element } from 'engine';

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {}, [])];
}

const Test = 1;
class ClassAndTemplate extends Element {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }

    render() {
        return tmpl;
    }

}
ClassAndTemplate.style = tmpl.style;

export default ClassAndTemplate;
