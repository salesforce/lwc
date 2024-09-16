import _implicitStylesheets from "./class.css";
import _implicitScopedStylesheets from "./class.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div class="foo${0}"${2}></div>`;
const $fragment2 = parseFragment`<div class="foo bar${0}"${2}></div>`;
const $fragment3 = parseFragment`<div class="foo bar${0}"${2}></div>`;
const $fragment4 = parseFragment`<div class="foo bar${0}"${2}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_static_fragment($fragment3, 5),
    api_static_fragment($fragment4, 7),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-44l3bs9cc8q";
tmpl.legacyStylesheetToken = "x-class_class";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
