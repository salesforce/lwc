import _cDefault from "c/default";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, c: api_custom_element } = $api;
  return $cmp.visible
    ? [api_text("Conditional Text")]
    : $cmp.elseifCondition
    ? [api_element("div", stc0, [api_text("Elseif!")])]
    : [api_custom_element("c-default", _cDefault, stc1, [api_text("Else!")])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
