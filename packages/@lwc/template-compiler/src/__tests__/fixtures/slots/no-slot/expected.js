import _xCmp from "x/cmp";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("x-cmp", _xCmp, stc0)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.version = 2;
