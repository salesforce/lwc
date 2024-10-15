import _implicitStylesheets from "./preserve-comments-on.css";
import _implicitScopedStylesheets from "./preserve-comments-on.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><!--only comments within elements can be static--></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, st: api_static_fragment } = $api;
  return [
    api_comment(" this comment should not be static "),
    api_static_fragment($fragment1, 1),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2hege9bfdij";
tmpl.legacyStylesheetToken = "x-preserve-comments-on_preserve-comments-on";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
