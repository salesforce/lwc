import _implicitStylesheets from "./invalid-attribute.css";
import _implicitScopedStylesheets from "./invalid-attribute.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  return stc0;
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1n02ki6f1ee";
tmpl.legacyStylesheetToken = "x-invalid-attribute_invalid-attribute";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
