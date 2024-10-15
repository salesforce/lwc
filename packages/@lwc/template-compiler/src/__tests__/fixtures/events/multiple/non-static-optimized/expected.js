import _implicitStylesheets from "./non-static-optimized.css";
import _implicitScopedStylesheets from "./non-static-optimized.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, h: api_element } = $api;
  const { _m0 } = $ctx;
  return [
    api_element("button", {
      key: 0,
      on:
        _m0 ||
        ($ctx._m0 = {
          click: api_bind($cmp.onClick),
          touchstart: api_bind($cmp.onTouchStart),
          touchend: api_bind($cmp.onTouchEnd),
        }),
    }),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-d9girnpd2k";
tmpl.legacyStylesheetToken = "x-non-static-optimized_non-static-optimized";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
