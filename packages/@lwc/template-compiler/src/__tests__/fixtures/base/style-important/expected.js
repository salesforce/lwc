import _implicitStylesheets from "./style-important.css";
import _implicitScopedStylesheets from "./style-important.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div style="background: blue !important; color: red; opacity: 0.5 !important;"${3}></div>`;
const $fragment2 = parseFragment`<div style="background: blue !important; color: red; opacity: 0.5 !important;"${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2pusua1q7v3";
tmpl.legacyStylesheetToken = "x-style-important_style-important";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
