import _implicitStylesheets from "./inline-both-custom-element.css";
import _implicitScopedStylesheets from "./inline-both-custom-element.scoped.css?scoped=true";
import _cHello from "c/hello";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [$cmp.ifTrue ? api_custom_element("c-hello", _cHello, stc0) : null];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6nf737430vn";
tmpl.legacyStylesheetToken =
  "x-inline-both-custom-element_inline-both-custom-element";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
