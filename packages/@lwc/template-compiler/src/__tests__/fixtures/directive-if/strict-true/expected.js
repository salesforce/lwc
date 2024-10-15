import _implicitStylesheets from "./strict-true.css";
import _implicitScopedStylesheets from "./strict-true.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      $cmp.isTrue === true ? api_static_fragment($fragment1, 2) : null,
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5smng9s8ocs";
tmpl.legacyStylesheetToken = "x-strict-true_strict-true";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
