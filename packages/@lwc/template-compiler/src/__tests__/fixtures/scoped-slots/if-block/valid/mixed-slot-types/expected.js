import _implicitStylesheets from "./mixed-slot-types.css";
import _implicitScopedStylesheets from "./mixed-slot-types.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "slotname1",
  },
  key: 1,
};
const stc1 = [];
const stc2 = {
  name: "slotname1",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, fr: api_fragment } = $api;
  return [
    $cmp.showStandard
      ? api_fragment(0, [api_slot("slotname1", stc0, stc1, $slotset)], 0)
      : $cmp.showVariant
        ? api_fragment(
            0,
            [
              api_slot(
                "slotname1",
                {
                  attrs: stc2,
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
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["slotname1"];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2og2ir50afk";
tmpl.legacyStylesheetToken = "x-mixed-slot-types_mixed-slot-types";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
