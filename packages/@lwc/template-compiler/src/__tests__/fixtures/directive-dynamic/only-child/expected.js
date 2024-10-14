import _implicitStylesheets from "./only-child.css";
import _implicitScopedStylesheets from "./only-child.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ddc: api_deprecated_dynamic_component } = $api;
  return [
    api_deprecated_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6eo18r0urvs";
tmpl.legacyStylesheetToken = "x-only-child_only-child";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
