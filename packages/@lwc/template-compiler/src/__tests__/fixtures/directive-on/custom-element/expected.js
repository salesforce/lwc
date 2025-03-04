import _implicitStylesheets from "./custom-element.css";
import _implicitScopedStylesheets from "./custom-element.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { cop: api_copy, c: api_custom_element } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_custom_element("x-foo", _xFoo, {
      key: 0,
      dynamicOn:
        (($ctx._m1 = api_copy($cmp.hello, _m0, _m1)),
        ($ctx._m0 = $cmp.hello),
        $ctx._m1),
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-i4i43q1672";
tmpl.legacyStylesheetToken = "x-custom-element_custom-element";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
