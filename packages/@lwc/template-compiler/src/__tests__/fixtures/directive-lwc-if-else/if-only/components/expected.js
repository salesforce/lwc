import _cCustom from "c/custom";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_custom_element("c-custom", _cCustom, stc0)], 0)
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
