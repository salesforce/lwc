import { Element } from 'engine';

function tmpl($api, $cmp, $slotset, $ctx) {
  return [$api.h("section", {}, [])];
}

class FooBar extends Element {
  render() {
    return tmpl;
  }

}

export default FooBar;
