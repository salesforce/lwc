import _implicitStylesheets from "./component.css";
import _implicitScopedStylesheets from "./component.scoped.css?scoped=true";
import _nsFoo from "ns/foo";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, c: api_custom_element, h: api_element } = $api;
  const { _m0 } = $ctx;
  return [
    api_element("section", stc0, [
      api_custom_element("ns-foo", _nsFoo, {
        key: 1,
        on:
          _m0 ||
          ($ctx._m0 = {
            foo: api_bind($cmp.handleFoo),
          }),
      }),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6a8uqob2ku4";
tmpl.legacyStylesheetToken = "x-component_component";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
