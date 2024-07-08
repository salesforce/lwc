import _implicitStylesheets from "./attribute-href-with-id-no-hash.css";
import _implicitScopedStylesheets from "./attribute-href-with-id-no-hash.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a href="https://example.com/kansai-airport"${3}>KIX</a>`;
const $fragment2 = parseFragment`<map${3}><area href="https://example.com/eneos-gas"${3}><area href="https://example.com/kawaramachi"${3}></map>`;
const $fragment3 = parseFragment`<h1${"a0:id"}${3}>Don&#x27;t forget your passport!</h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    gid: api_scoped_id,
    sp: api_static_part,
  } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_static_fragment($fragment3, 5, [
      api_static_part(
        0,
        {
          attrs: {
            id: api_scoped_id("kansai-airport"),
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-37mnkrd5rqc";
tmpl.legacyStylesheetToken =
  "x-attribute-href-with-id-no-hash_attribute-href-with-id-no-hash";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
