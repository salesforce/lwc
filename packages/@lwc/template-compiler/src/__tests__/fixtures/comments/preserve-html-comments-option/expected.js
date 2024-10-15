import _implicitStylesheets from "./preserve-html-comments-option.css";
import _implicitScopedStylesheets from "./preserve-html-comments-option.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<button${3}>click me</button>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, st: api_static_fragment } = $api;
  return [
    api_comment(" This is an HTML comment "),
    api_static_fragment($fragment1, 1),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-gaekmoo0tf";
tmpl.legacyStylesheetToken =
  "x-preserve-html-comments-option_preserve-html-comments-option";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
