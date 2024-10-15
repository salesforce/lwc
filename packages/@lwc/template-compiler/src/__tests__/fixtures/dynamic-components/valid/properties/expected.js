import _implicitStylesheets from "./properties.css";
import _implicitScopedStylesheets from "./properties.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    tabIndex: "0",
    ariaAtomic: true,
    myProp: "value",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component } = $api;
  return [api_dynamic_component($cmp.ctor, stc0)];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3unrm1630av";
tmpl.legacyStylesheetToken = "x-properties_properties";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
