import _implicitStylesheets from "./class-dynamic-deoptimized-with-object-binding.css";
import _implicitScopedStylesheets from "./class-dynamic-deoptimized-with-object-binding.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ncls: api_normalize_class_name, h: api_element } = $api;
  return [
    api_element("div", {
      className: api_normalize_class_name($cmp.computed),
      key: 0,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5tqvhdlbj7o";
tmpl.legacyStylesheetToken =
  "x-class-dynamic-deoptimized-with-object-binding_class-dynamic-deoptimized-with-object-binding";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
