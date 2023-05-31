import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    c: api_custom_element,
    ddc: api_deprecated_dynamic_component,
    dc: api_dynamic_component,
  } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_deprecated_dynamic_component("x-foo", $cmp.dynamicCtor, stc1),
    api_dynamic_component($cmp.ctor, stc2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
