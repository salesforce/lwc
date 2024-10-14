import _implicitStylesheets from "./directive-if.css";
import _implicitScopedStylesheets from "./directive-if.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>true branch</p>`;
const $fragment2 = parseFragment`<p${3}>false branch</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, st: api_static_fragment } = $api;
  return [
    $cmp.truthyValue ? api_comment(" HTML comment inside if:true ") : null,
    $cmp.truthyValue ? api_static_fragment($fragment1, 1) : null,
    !$cmp.truthyValue ? api_comment(" HTML comment inside if:false ") : null,
    !$cmp.truthyValue ? api_static_fragment($fragment2, 3) : null,
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6a2nu6tldoq";
tmpl.legacyStylesheetToken = "x-directive-if_directive-if";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
