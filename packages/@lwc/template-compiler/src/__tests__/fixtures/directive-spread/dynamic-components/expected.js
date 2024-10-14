import _implicitStylesheets from "./dynamic-components.css";
import _implicitScopedStylesheets from "./dynamic-components.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, {
      props: {
        ...$cmp.hello,
      },
      key: 0,
    }),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
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
