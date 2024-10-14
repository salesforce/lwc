import _implicitStylesheets from "./invalid-attribute-with-children.css";
import _implicitScopedStylesheets from "./invalid-attribute-with-children.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  return stc0;
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-15ba9fr5s6u";
tmpl.legacyStylesheetToken =
  "x-invalid-attribute-with-children_invalid-attribute-with-children";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
