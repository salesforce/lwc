import { Element } from 'engine';
import { getTodo } from 'todo';
import { getHello } from '@schema/foo.bar';
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
class Metadata extends Element {
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
            params: {},
            static: {},
            adapter: getTodo
        },
        wiredMethod: {
            params: { name: "publicProp" },
            static: { fields: ['one', 'two'] },
            adapter: getHello,
            method: 1
        }
    };
    Metadata.style = tmpl.style;
    const HELLOWORLD = "hello world!";
function ohai(name) {
    return "ohai, " + name;
}
export { HELLOWORLD, ohai };
export default Metadata;