import { Element } from 'engine';
import externalDep from 'another-module';

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
    tmpl.hostToken = 'x-external_external-host';
    tmpl.shadowToken = 'x-external_external';

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = 'x-external_external';
    style$$1.textContent = style('x-external_external');
    document.head.appendChild(style$$1);
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
