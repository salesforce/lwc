import _implicitStylesheets from "./attribute-href-with-id.css";
import _implicitScopedStylesheets from "./attribute-href-with-id.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a${"a0:href"}${3}>KIX</a>`;
const $fragment2 = parseFragment`<map${3}><area${"a1:href"}${3}><area${"a2:href"}${3}></map>`;
const $fragment3 = parseFragment`<h1${"a0:id"}${3}>Don&#x27;t forget your passport!</h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    fid: api_scoped_frag_id,
    sp: api_static_part,
    st: api_static_fragment,
    gid: api_scoped_id,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          attrs: {
            href: api_scoped_frag_id("#kansai-airport"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(
        1,
        {
          attrs: {
            href: api_scoped_frag_id("#eneos-gas"),
          },
        },
        null
      ),
      api_static_part(
        2,
        {
          attrs: {
            href: api_scoped_frag_id("#kawaramachi"),
          },
        },
        null
      ),
    ]),
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
tmpl.stylesheetToken = "lwc-k7u0u67but";
tmpl.legacyStylesheetToken = "x-attribute-href-with-id_attribute-href-with-id";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
