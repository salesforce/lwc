import _cCustom from "c/custom";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = ["Visible Header"];
const stc2 = {
  key: 2,
};
const stc3 = ["First Alternative Header"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(
          0,
          [api_custom_element("c-custom", _cCustom, stc0, stc1, 128)],
          0
        )
      : $cmp.elseifCondition
      ? api_fragment(
          0,
          [api_custom_element("c-custom", _cCustom, stc2, stc3, 128)],
          0
        )
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
