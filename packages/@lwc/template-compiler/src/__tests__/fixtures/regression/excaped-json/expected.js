import _xTest from "x/test";
import { registerTemplate } from "lwc";
const stc0 = {
  props: {
    json: '[{"column":"ID","value":"5e","operator":"equals","f":true}]',
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("x-test", _xTest, stc0, stc1)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
