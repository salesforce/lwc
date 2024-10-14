import _implicitStylesheets from "./static-content-optimization-false.css";
import _implicitScopedStylesheets from "./static-content-optimization-false.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("p", stc0, [api_text("foo&bar")]),
    api_element("p", stc1, [api_text("const { foo } = bar;")]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2m6fifibgq7";
tmpl.legacyStylesheetToken =
  "x-static-content-optimization-false_static-content-optimization-false";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
