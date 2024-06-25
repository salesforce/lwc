import _implicitStylesheets from "./attribute-href-with-id.css";
import _implicitScopedStylesheets from "./attribute-href-with-id.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${"a0:id"}${3}>Don&#x27;t forget your passport!</h1>`;
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    fid: api_scoped_frag_id,
    t: api_text,
    h: api_element,
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_element(
      "a",
      {
        attrs: {
          href: api_scoped_frag_id("#kansai-airport"),
        },
        key: 0,
      },
      [api_text("KIX")]
    ),
    api_element("map", stc0, [
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id("#eneos-gas"),
        },
        key: 2,
      }),
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id("#kawaramachi"),
        },
        key: 3,
      }),
    ]),
    api_static_fragment($fragment1, 5, [
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
