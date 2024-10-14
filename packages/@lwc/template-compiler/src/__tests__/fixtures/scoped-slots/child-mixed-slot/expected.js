import _implicitStylesheets from "./child-mixed-slot.css";
import _implicitScopedStylesheets from "./child-mixed-slot.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  name: "slotname1",
};
const stc1 = [];
const stc2 = {
  attrs: {
    name: "slotname2",
  },
  key: 1,
};
const stc3 = {
  key: 2,
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
    api_slot("slotname2", stc2, stc1, $slotset),
    api_slot("", stc3, stc1, $slotset),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "slotname1", "slotname2"];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-75jblr64tev";
tmpl.legacyStylesheetToken = "x-child-mixed-slot_child-mixed-slot";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
