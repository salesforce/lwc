import _implicitStylesheets from "./child-with-foreach.css";
import _implicitScopedStylesheets from "./child-with-foreach.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, s: api_slot, i: api_iterator } = $api;
  return api_iterator($cmp.items, function (item) {
    return api_slot(
      "",
      {
        key: api_key(0, item.id),
        slotData: item,
      },
      stc0,
      $slotset
    );
  });
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2gr7k6l9fj";
tmpl.legacyStylesheetToken = "x-child-with-foreach_child-with-foreach";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
