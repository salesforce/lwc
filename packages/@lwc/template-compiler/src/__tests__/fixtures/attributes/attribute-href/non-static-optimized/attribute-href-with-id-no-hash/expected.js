import _implicitStylesheets from "./attribute-href-with-id-no-hash.css";
import _implicitScopedStylesheets from "./attribute-href-with-id-no-hash.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    href: "https://example.com/kansai-airport",
  },
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    href: "https://example.com/eneos-gas",
  },
  key: 2,
};
const stc3 = {
  attrs: {
    href: "https://example.com/kawaramachi",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, gid: api_scoped_id } = $api;
  return [
    api_element("a", stc0, [api_text("KIX")]),
    api_element("map", stc1, [
      api_element("area", stc2),
      api_element("area", stc3),
    ]),
    api_element(
      "h1",
      {
        attrs: {
          id: api_scoped_id("kansai-airport"),
        },
        key: 4,
      },
      [api_text("Don't forget your passport!")]
    ),
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
