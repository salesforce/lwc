import _implicitStylesheets from "./static-optimized.css";
import _implicitScopedStylesheets from "./static-optimized.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<button${3}></button>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          on:
            _m1 ||
            ($ctx._m1 = {
              click: api_bind($cmp.onClick),
              touchstart: api_bind($cmp.onTouchStart),
              touchend: api_bind($cmp.onTouchEnd),
            }),
        },
        null
      ),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7n28hdp1g54";
tmpl.legacyStylesheetToken = "x-static-optimized_static-optimized";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
