import _xTest from "x/test";
import { registerTemplate, renderApi } from "lwc";
const { c: api_custom_element } = renderApi;
const stc0 = {
  props: {
    json: '[{"column":"ID","value":"5e","operator":"equals","f":true}]',
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_custom_element("x-test", _xTest, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
