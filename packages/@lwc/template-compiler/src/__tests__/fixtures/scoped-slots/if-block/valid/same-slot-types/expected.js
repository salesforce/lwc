import _implicitStylesheets from "./same-slot-types.css";
import _implicitScopedStylesheets from "./same-slot-types.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  name: "slotname1",
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, fr: api_fragment } = $api;
  return [
    $cmp.showStandard
      ? api_fragment(
          0,
          [
            api_slot(
              "slotname1",
              {
                attrs: stc0,
                key: 1,
                slotData: $cmp.slot1VariantData,
              },
              stc1,
              $slotset
            ),
          ],
          0
        )
      : $cmp.showVariant
        ? api_fragment(
            0,
            [
              api_slot(
                "slotname1",
                {
                  attrs: stc0,
                  key: 2,
                  slotData: $cmp.slot1VariantData,
                },
                stc1,
                $slotset
              ),
            ],
            0
          )
        : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["slotname1"];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-70bcseng4gg";
tmpl.legacyStylesheetToken = "x-same-slot-types_same-slot-types";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
