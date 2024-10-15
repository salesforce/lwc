import _implicitStylesheets from "./style-expression.css";
import _implicitScopedStylesheets from "./style-expression.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${"s0"}${3}></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          style: $cmp.customStyle,
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1e7dui2pf3p";
tmpl.legacyStylesheetToken = "x-style-expression_style-expression";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
