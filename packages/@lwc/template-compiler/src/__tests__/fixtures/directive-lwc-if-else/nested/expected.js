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
  key: 1,
};
const stc1 = {
  key: 2,
};
const stc2 = {
  key: 4,
};
const stc3 = {
  key: 6,
};
const stc4 = {
  key: 7,
};
const stc5 = {
  key: 8,
};
const stc6 = {
  key: 9,
};
const stc7 = {
  key: 10,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, fr: api_fragment, t: api_text } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_custom_element("c-custom", _cCustom, stc0)], 0)
      : $cmp.elseif
      ? api_fragment(
          0,
          [
            api_custom_element("c-custom-elseif", _cCustomElseif, stc1, [
              api_text("If Text"),
              $cmp.showNestedIf
                ? api_fragment(
                    3,
                    [
                      api_custom_element("c-nested", _cNested, stc2, [
                        $cmp.doubleNestedIf
                          ? api_fragment(
                              5,
                              [
                                api_custom_element(
                                  "c-double-nested",
                                  _cDoubleNested,
                                  stc3
                                ),
                              ],
                              0
                            )
                          : api_fragment(
                              5,
                              [
                                api_custom_element(
                                  "c-double-nested-else",
                                  _cDoubleNestedElse,
                                  stc4
                                ),
                              ],
                              0
                            ),
                      ]),
                    ],
                    0
                  )
                : $cmp.elseifNested
                ? api_fragment(
                    3,
                    [
                      api_custom_element(
                        "c-nested-elseif",
                        _cNestedElseif,
                        stc5
                      ),
                    ],
                    0
                  )
                : api_fragment(
                    3,
                    [api_custom_element("c-nested-else", _cNestedElse, stc6)],
                    0
                  ),
            ]),
          ],
          0
        )
      : api_fragment(
          0,
          [api_custom_element("c-custom-else", _cCustomElse, stc7)],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
