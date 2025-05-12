import _implicitStylesheets from "./dynamic-component.css";
import _implicitScopedStylesheets from "./dynamic-component.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.Ctor, {
      key: 0,
      dynamicOnRaw: $cmp.hello,
      dynamicOn: {
        __proto__: null,
        ...$cmp.hello,
      },
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2aur4v16kjs";
tmpl.legacyStylesheetToken = "x-dynamic-component_dynamic-component";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
