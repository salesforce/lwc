import _implicitStylesheets from "./inline-sibling-static.css";
import _implicitScopedStylesheets from "./inline-sibling-static.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>3</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      $cmp.isTrue ? api_static_fragment($fragment1, 2) : null,
      api_text(api_dynamic_text($cmp.foo)),
      $cmp.isTrue ? api_static_fragment($fragment2, 4) : null,
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1mpsc4up5i6";
tmpl.legacyStylesheetToken = "x-inline-sibling-static_inline-sibling-static";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
