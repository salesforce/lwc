import _implicitStylesheets from "./error-computed-property.css";
import _implicitScopedStylesheets from "./error-computed-property.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text } = $api;
  return [api_text(api_dynamic_text($cmp.val[$cmp.state.foo]))];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6ihk6g6hnnt";
tmpl.legacyStylesheetToken =
  "x-error-computed-property_error-computed-property";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
