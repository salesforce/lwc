import _implicitStylesheets from "./duplicate-named-slot.css";
import _implicitScopedStylesheets from "./duplicate-named-slot.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    name: "foo",
  },
  key: 0,
};
const stc1 = [];
const stc2 = {
  attrs: {
    name: "foo",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot } = $api;
  return [
    api_slot("foo", stc0, stc1, $slotset),
    api_slot("foo", stc2, stc1, $slotset),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["foo"];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3im0sh599q6";
tmpl.legacyStylesheetToken = "x-duplicate-named-slot_duplicate-named-slot";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
