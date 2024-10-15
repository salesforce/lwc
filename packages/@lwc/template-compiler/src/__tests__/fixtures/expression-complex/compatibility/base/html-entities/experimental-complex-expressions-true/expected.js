import _implicitStylesheets from "./experimental-complex-expressions-true.css";
import _implicitScopedStylesheets from "./experimental-complex-expressions-true.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>foo&amp;bar</p>`;
const $fragment2 = parseFragment`<p${3}>const { foo } = bar;</p>`;
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
tmpl.stylesheetToken = "lwc-5t3hn3vkg17";
tmpl.legacyStylesheetToken =
  "x-experimental-complex-expressions-true_experimental-complex-expressions-true";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
