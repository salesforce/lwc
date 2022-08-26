import _cCustom from "c/custom";
import _cDoubleNested from "c/doubleNested";
import _cDoubleNestedElse from "c/doubleNestedElse";
import _cNested from "c/nested";
import _cNestedElseif from "c/nestedElseif";
import _cNestedElse from "c/nestedElse";
import _cCustomElseif from "c/customElseif";
import _cCustomElse from "c/customElse";
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
const stc3 = {
  key: 3,
};
const stc4 = {
  key: 4,
};
const stc5 = {
  key: 5,
};
const stc6 = {
  key: 6,
};
const stc7 = {
  key: 7,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, t: api_text, f: api_flatten } = $api;
  return $cmp.visible
    ? [api_custom_element("c-custom", _cCustom, stc0)]
    : $cmp.elseif
    ? [
        api_custom_element(
          "c-custom-elseif",
          _cCustomElseif,
          stc1,
          api_flatten([
            api_text("If Text"),
            $cmp.showNestedIf
              ? [
                  api_custom_element(
                    "c-nested",
                    _cNested,
                    stc2,
                    $cmp.doubleNestedIf
                      ? [
                          api_custom_element(
                            "c-double-nested",
                            _cDoubleNested,
                            stc3
                          ),
                        ]
                      : [
                          api_custom_element(
                            "c-double-nested-else",
                            _cDoubleNestedElse,
                            stc4
                          ),
                        ]
                  ),
                ]
              : $cmp.elseifNested
              ? [api_custom_element("c-nested-elseif", _cNestedElseif, stc5)]
              : [api_custom_element("c-nested-else", _cNestedElse, stc6)],
          ])
        ),
      ]
    : [api_custom_element("c-custom-else", _cCustomElse, stc7)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
