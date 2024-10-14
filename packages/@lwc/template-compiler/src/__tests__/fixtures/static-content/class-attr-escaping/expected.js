import _implicitStylesheets from "./class-attr-escaping.css";
import _implicitScopedStylesheets from "./class-attr-escaping.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1 class="&quot;>\\x3Cscript>alert('pwned')\\x3C/script>\\x3Ch1 foo=&quot;${0}"${2}></h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1)];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-287h74uthl5";
tmpl.legacyStylesheetToken = "x-class-attr-escaping_class-attr-escaping";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
