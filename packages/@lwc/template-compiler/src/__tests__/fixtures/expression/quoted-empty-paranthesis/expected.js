import _implicitStylesheets from "./quoted-empty-paranthesis.css";
import _implicitScopedStylesheets from "./quoted-empty-paranthesis.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Hello world!</h1>`;
const $fragment2 = parseFragment`<div data-foo="{}"${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-70a5ikbn661";
tmpl.legacyStylesheetToken =
  "x-quoted-empty-paranthesis_quoted-empty-paranthesis";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
