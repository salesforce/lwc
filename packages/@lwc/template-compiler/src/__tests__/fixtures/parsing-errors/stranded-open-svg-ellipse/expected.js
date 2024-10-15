import _implicitStylesheets from "./stranded-open-svg-ellipse.css";
import _implicitScopedStylesheets from "./stranded-open-svg-ellipse.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg xmlns="http://www.w3.org/2000/svg"${3}><ellipse${3}/></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1)];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4l5bd87bi6t";
tmpl.legacyStylesheetToken =
  "x-stranded-open-svg-ellipse_stranded-open-svg-ellipse";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
