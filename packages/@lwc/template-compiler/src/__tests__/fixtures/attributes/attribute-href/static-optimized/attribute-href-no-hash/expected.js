import _implicitStylesheets from "./attribute-href-no-hash.css";
import _implicitScopedStylesheets from "./attribute-href-no-hash.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a href="https://example.com/yasaka-taxi"${3}>Yasaka Taxi</a>`;
const $fragment2 = parseFragment`<map${3}><area href="https://example.com/eneos-gas"${3}><area href="https://example.com/kawaramachi"${3}></map>`;
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
tmpl.stylesheetToken = "lwc-1sm3fsuk72n";
tmpl.legacyStylesheetToken = "x-attribute-href-no-hash_attribute-href-no-hash";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
