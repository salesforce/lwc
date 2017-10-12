import { Element } from 'engine';
import externalDep from 'another-module';

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {}, [])];
}

class Foo extends Element {
    constructor(...args) {
        var _temp;

        return _temp = super(...args), this.anotherModule = externalDep, _temp;
    }

    render() {
        return tmpl;
    }

}

export default Foo;
