import _implicitStylesheets from "./attribute-href.css";
import _implicitScopedStylesheets from "./attribute-href.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a href="#yasaka-taxi"${3}>Yasaka Taxi</a>`;
const $fragment2 = parseFragment`<map${3}><area href="#eneos-gas"${3}><area href="#kawaramachi"${3}></map>`;
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
tmpl.stylesheetToken = "lwc-5jt7h1qitjc";
tmpl.legacyStylesheetToken = "x-attribute-href_attribute-href";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
