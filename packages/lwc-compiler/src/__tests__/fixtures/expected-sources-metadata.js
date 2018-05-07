import _xBar from 'x-bar';
import { Element } from 'engine';
import { getTodo } from 'todo';
import { getHello } from '@schema/foo.bar';
const style = undefined;
function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        c: api_custom_element
    } = $api;
    return [api_custom_element("x-bar", _xBar, {
        key: 1
    })];
}
if (style) {
    const tagName = 'x-foo';
    const token = 'x-foo_foo';
    tmpl.token = token;
    tmpl.style = style(tagName, token);
}
class Metadata extends Element {
    constructor(...args) {
        var _temp;
        return _temp = super(...args), this.publicProp = void 0, this.wiredProp = void 0, _temp;
    }
    publicMethod(name) {
        return "hello" + name;
    }
    wiredMethod(result) {}
    render() {
        return tmpl;
    }
}
Metadata.publicProps = {
    publicProp: {
        config: 0
    }
};
Metadata.publicMethods = ["publicMethod"];
Metadata.wire = {
    wiredProp: {
        adapter: getTodo,
        params: {},
        static: {}
    },
    wiredMethod: {
        adapter: getHello,
        params: {
          name: "publicProp"
        },
        static: {
          fields: ['one', 'two']
        },
        method: 1
    }
};
Metadata.style = tmpl.style;
const HELLOWORLD = "hello world!";
function ohai(name) {
    return "ohai, " + name;
}
export default Metadata;
export { HELLOWORLD, ohai };
