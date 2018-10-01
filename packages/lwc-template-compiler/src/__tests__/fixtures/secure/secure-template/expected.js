import _xTest from "x/test";
import { secure } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
const {
    c: api_custom_element
} = $api;

return [api_custom_element("x-test", _xTest, {
    key: 1
}, [])];
}

export default secure.registerTemplate(tmpl);
