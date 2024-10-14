import _implicitStylesheets from "./attr-escaping.css";
import _implicitScopedStylesheets from "./attr-escaping.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1 data-foo="&quot;>\\x3Cscript>alert('pwned')\\x3C/script>\\x3Ch1 foo=&quot;"${3}></h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1)];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7dlcqn5v5n";
tmpl.legacyStylesheetToken = "x-attr-escaping_attr-escaping";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
