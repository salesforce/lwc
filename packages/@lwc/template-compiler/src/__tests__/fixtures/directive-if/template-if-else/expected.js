import _implicitStylesheets from "./template-if-else.css";
import _implicitScopedStylesheets from "./template-if-else.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>2</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    $cmp.isTrue ? api_static_fragment($fragment1, 1) : null,
    !$cmp.isTrue2 ? api_static_fragment($fragment2, 3) : null,
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-f9q64bko29";
tmpl.legacyStylesheetToken = "x-template-if-else_template-if-else";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
