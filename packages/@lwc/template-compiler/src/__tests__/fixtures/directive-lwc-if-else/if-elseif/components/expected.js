import _cCustom from "c/custom";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, c: api_custom_element } = $api;
  return $cmp.visible
    ? [
        api_custom_element("c-custom", _cCustom, stc0, [
          api_text("Visible Header"),
        ]),
      ]
    : $cmp.elseifCondition
    ? [
        api_custom_element("c-custom", _cCustom, stc1, [
          api_text("First Alternative Header"),
        ]),
      ]
    : stc2;
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
