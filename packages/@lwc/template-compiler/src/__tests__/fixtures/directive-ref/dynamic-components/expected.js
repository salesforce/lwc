import _implicitStylesheets from "./dynamic-components.css";
import _implicitScopedStylesheets from "./dynamic-components.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  ref: "foo",
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, dc: api_dynamic_component } = $api;
  return [api_dynamic_component($cmp.ctor, stc0, [api_text("Foo")])];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.hasRefs = true;
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-73vspqvsbp7";
tmpl.legacyStylesheetToken = "x-dynamic-components_dynamic-components";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
