import _xBar from 'x/bar';
import { registerTemplate, LightningElement } from 'lwc';
import { getTodo } from 'todo';
import { getHello } from '@schema/foo.bar';
function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        c: api_custom_element
    } = $api;
    return [api_custom_element("x-bar", _xBar, {
        key: 1
    }, [])];
}
var _tmpl = registerTemplate(tmpl);
class Metadata extends LightningElement {
    constructor(...args) {
        super(...args);
        this.publicProp = void 0;
        this.wiredProp = void 0;
    }
    publicMethod(name) {
        return "hello" + name;
    }
    wiredMethod(result) {}
    render() {
        return _tmpl;
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
const HELLOWORLD = "hello world!";
function ohai(name) {
    return "ohai, " + name;
}
export default Metadata;
export { HELLOWORLD, ohai };
