import _implicitStylesheets from "./template-sibiling.css";
import _implicitScopedStylesheets from "./template-sibiling.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>2</p>`;
const $fragment3 = parseFragment`<p${3}>3</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_static_fragment($fragment1, 2),
      $cmp.bar ? api_static_fragment($fragment2, 4) : null,
      api_static_fragment($fragment3, 6),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4m9tr5ct9rp";
tmpl.legacyStylesheetToken = "x-template-sibiling_template-sibiling";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
