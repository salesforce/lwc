import { Element } from 'engine';
import externalDep from 'another-module';

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {
      ck: 1
  }, [])];
}

if (style) {
    const tagName = 'x-external';
    const token = 'x-external_external';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
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
Foo.style = tmpl.style;

export default Foo;
