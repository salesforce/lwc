import _implicitStylesheets from "./simple.css";
import _implicitScopedStylesheets from "./simple.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 1,
};
const stc1 = [];
const stc2 = {
  attrs: {
    name: "conditional-slot",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, fr: api_fragment } = $api;
  return [
    $cmp.condition
      ? api_fragment(0, [api_slot("conditional-slot", stc0, stc1, $slotset)], 0)
      : api_fragment(
          0,
          [api_slot("conditional-slot", stc2, stc1, $slotset)],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["conditional-slot"];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1lae0rspni6";
tmpl.legacyStylesheetToken = "x-simple_simple";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
