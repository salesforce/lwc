import _implicitStylesheets from "./child-default-slot-content.css";
import _implicitScopedStylesheets from "./child-default-slot-content.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, s: api_slot } = $api;
  return [
    api_slot(
      "",
      {
        key: 0,
        slotData: $cmp.item,
      },
      [api_text("Foo " + api_dynamic_text($cmp.item))],
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6di869hpvmf";
tmpl.legacyStylesheetToken =
  "x-child-default-slot-content_child-default-slot-content";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
