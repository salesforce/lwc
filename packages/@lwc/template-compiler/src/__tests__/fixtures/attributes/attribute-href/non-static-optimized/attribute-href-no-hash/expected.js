import _implicitStylesheets from "./attribute-href-no-hash.css";
import _implicitScopedStylesheets from "./attribute-href-no-hash.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    href: "https://example.com/yasaka-taxi",
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
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("a", stc0, [api_text("Yasaka Taxi")]),
    api_element("map", stc1, [
      api_element("area", stc2),
      api_element("area", stc3),
    ]),
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
