import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, dc: api_dynamic_component } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_dynamic_component($cmp.ctor, stc1),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
