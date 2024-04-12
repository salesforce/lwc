import _implicitStylesheets from "./template-multiple.css";
import _implicitScopedStylesheets from "./template-multiple.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>2</p>`;
const $fragment3 = parseFragment`<p${3}>3</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    $cmp.isTrue ? api_static_fragment($fragment1, 1) : null,
    $cmp.isTrue ? api_static_fragment($fragment2, 3) : null,
    $cmp.isTrue ? api_static_fragment($fragment3, 5) : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-766do8vn4oi";
tmpl.legacyStylesheetToken = "x-template-multiple_template-multiple";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
