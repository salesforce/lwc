import _implicitStylesheets from "./optimized.css";
import _implicitScopedStylesheets from "./optimized.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section data-id="these-should-be-false"${3}><div spellcheck="false"${3}></div><div spellcheck="false"${3}></div></section>`;
const $fragment2 = parseFragment`<section data-id="these-should-be-empty-string"${3}><div spellcheck${3}></div></section>`;
const $fragment3 = parseFragment`<section data-id="these-should-be-true"${3}><div spellcheck="true"${3}></div><div spellcheck="true"${3}></div><div spellcheck="true"${3}></div><div spellcheck="true"${3}></div><div spellcheck="true"${3}></div></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_static_fragment($fragment3, 5),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6dfvqpqt2d0";
tmpl.legacyStylesheetToken = "x-optimized_optimized";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
