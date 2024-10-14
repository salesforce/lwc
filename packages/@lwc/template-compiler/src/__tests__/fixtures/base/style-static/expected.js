import _implicitStylesheets from "./style-static.css";
import _implicitScopedStylesheets from "./style-static.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section style="font-size: 12px; color: red; margin: 10px 5px 10px;"${3}></section>`;
const $fragment2 = parseFragment`<section style="--my-color: blue; color: var(--my-color);"${3}></section>`;
const $fragment3 = parseFragment`<section style="font-size: 12px; color: red; margin: 10px 5px 10px;"${3}></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_static_fragment($fragment3, 5),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7g8p0uutims";
tmpl.legacyStylesheetToken = "x-style-static_style-static";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
