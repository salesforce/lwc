import _implicitStylesheets from "./class-dynamic-deoptimized-without-object-binding.css";
import _implicitScopedStylesheets from "./class-dynamic-deoptimized-without-object-binding.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("div", {
      className: $cmp.computed,
      key: 0,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2rtjj54ske2";
tmpl.legacyStylesheetToken =
  "x-class-dynamic-deoptimized-without-object-binding_class-dynamic-deoptimized-without-object-binding";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
