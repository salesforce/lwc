import _implicitStylesheets from "./slots-sharing-bindings.css";
import _implicitScopedStylesheets from "./slots-sharing-bindings.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = [];
const stc1 = {
  name: "slotname1",
};
const stc2 = {
  name: "slotname2",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return [
    api_slot(
      "",
      {
        key: 0,
        slotData: $cmp.slotdata,
      },
      stc0,
      $slotset
    ),
    api_slot(
      "slotname1",
      {
        attrs: stc1,
        key: 1,
        slotData: $cmp.slotdata,
      },
      stc0,
      $slotset
    ),
    api_slot(
      "slotname2",
      {
        attrs: stc2,
        key: 2,
        slotData: $cmp.slotdata,
      },
      stc0,
      $slotset
    ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "slotname1", "slotname2"];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-26f7f538c7h";
tmpl.legacyStylesheetToken = "x-slots-sharing-bindings_slots-sharing-bindings";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
