import { registerTemplate, registerComponent, LightningElement, registerDecorators } from 'lwc';
import _xBar from 'x/bar';
import { getTodo } from 'todo';
import { getHello } from '@schema/foo.bar';

function tmpl($api, $cmp, $slotset, $ctx) {
    const {
    c: api_custom_element
    } = $api;

    return [api_custom_element("x-bar", _xBar, {
    key: 2
    }, [])];
}

var _tmpl = registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetTokens = {
    hostAttribute: "x-foo_foo-host",
    shadowAttribute: "x-foo_foo"
};

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

}

registerDecorators(Metadata, {
    publicProps: {
    publicProp: {
        config: 0
    }
    },
    publicMethods: ["publicMethod"],
    wire: {
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
    }
});

var foo = registerComponent(Metadata, {
    tmpl: _tmpl
});
const HELLOWORLD = "hello world!";
function ohai(name) {
    return "ohai, " + name;
}

export default foo;
export { HELLOWORLD, ohai };
