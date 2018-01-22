import { Element } from 'engine';

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {}, [])];
}

if (style) {
    const tagName = 'x-foo';
    const token = 'x-foo_foo';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
}

const Test = 1;
class ClassAndTemplate extends Element {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }

    get bar() {
        return this._bar;
    }
    set bar(value) {
        this._bar = value;
    }
    hello() {
        return 'hello world!';
    }
    render() {
        return tmpl;
    }

}
ClassAndTemplate.publicProps = {
    foo: {
        config: 0
    },
    bar: {
        config: 3
    }
};
ClassAndTemplate.publicMethods = ["hello"];
ClassAndTemplate.style = tmpl.style;

export default ClassAndTemplate;
