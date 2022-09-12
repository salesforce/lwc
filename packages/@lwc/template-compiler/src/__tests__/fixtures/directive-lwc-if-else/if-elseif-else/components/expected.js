import _cCustom from "c/custom";
import _cCustomElseif from "c/customElseif";
import _cCustomElse from "c/customElse";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = {
  key: 2,
};
const stc2 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment("if-fr0", [api_custom_element("c-custom", _cCustom, stc0)])
      : api_fragment("if-fr0", [
          $cmp.elseif
            ? api_fragment("if-fr0", [
                api_custom_element("c-custom-elseif", _cCustomElseif, stc1),
              ])
            : api_fragment("if-fr0", [
                api_custom_element("c-custom-else", _cCustomElse, stc2),
              ]),
        ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
