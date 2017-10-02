import { Element } from 'engine';

function tmpl($api, $cmp, $slotset, $ctx) {
  return [$api.h("section", {}, [])];
}

class Default extends Element {
  render() {
    return tmpl;
  }

}

export default Default;
