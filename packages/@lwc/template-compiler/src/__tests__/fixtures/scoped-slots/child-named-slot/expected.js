import _implicitStylesheets from "./child-named-slot.css";
import _implicitScopedStylesheets from "./child-named-slot.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  name: "slotname1",
};
const stc1 = [];
const stc2 = {
  name: "slotname2",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return [
    api_slot(
      "slotname1",
      {
        attrs: stc0,
        key: 0,
        slotData: $cmp.slot1data,
      },
      stc1,
      $slotset
    ),
    api_slot(
      "slotname2",
      {
        attrs: stc2,
        key: 1,
        slotData: $cmp.slot2data,
      },
      stc1,
      $slotset
    ),
    api_slot(
      "",
      {
        key: 2,
        slotData: $cmp.defaultdata,
      },
      stc1,
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "slotname1", "slotname2"];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-34oecl8jnu5";
tmpl.legacyStylesheetToken = "x-child-named-slot_child-named-slot";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
