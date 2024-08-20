import _implicitStylesheets from "./attributes.css";
import _implicitScopedStylesheets from "./attributes.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  "slds-style": true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, dc: api_dynamic_component } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_dynamic_component($cmp.ctor, {
      classMap: stc0,
      slotAssignment: "slotName",
      key: 0,
      on:
        $ctx._m1 ||
        ($ctx._m1 = {
          click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
        }),
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-33v8klcvlb2";
tmpl.legacyStylesheetToken = "x-attributes_attributes";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
