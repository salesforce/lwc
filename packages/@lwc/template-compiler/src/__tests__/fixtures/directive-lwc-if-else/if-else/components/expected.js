import _cCustom from "c/custom";
import _cCustomAlt from "c/customAlt";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return $cmp.visible
    ? [api_custom_element("c-custom", _cCustom, stc0)]
    : [api_custom_element("c-custom-alt", _cCustomAlt, stc1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
