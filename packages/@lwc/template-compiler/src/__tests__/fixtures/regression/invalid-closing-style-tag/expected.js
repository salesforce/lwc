import _implicitStylesheets from "./invalid-closing-style-tag.css";
import _implicitScopedStylesheets from "./invalid-closing-style-tag.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text } = $api;
  return [api_text("</style>" + api_dynamic_text($cmp.text))];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-72nu6n6rm0a";
tmpl.legacyStylesheetToken =
  "x-invalid-closing-style-tag_invalid-closing-style-tag";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
