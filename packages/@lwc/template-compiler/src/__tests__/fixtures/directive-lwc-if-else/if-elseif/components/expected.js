import _cCustom from "c/custom";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, c: api_custom_element, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(
          0,
          [
            api_custom_element("c-custom", _cCustom, stc0, [
              api_text("Visible Header"),
            ]),
          ],
          0
        )
      : $cmp.elseifCondition
      ? api_fragment(
          0,
          [
            api_custom_element("c-custom", _cCustom, stc1, [
              api_text("First Alternative Header"),
            ]),
          ],
          0
        )
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
