import _implicitStylesheets from "./attribute-href-with-id-expression.css";
import _implicitScopedStylesheets from "./attribute-href-with-id-expression.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    fid: api_scoped_frag_id,
    t: api_text,
    h: api_element,
    gid: api_scoped_id,
  } = $api;
  return [
    api_element(
      "a",
      {
        attrs: {
          href: api_scoped_frag_id($cmp.narita),
        },
        key: 0,
      },
      [api_text("KIX")]
    ),
    api_element("map", stc0, [
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id($cmp.haneda),
        },
        key: 2,
      }),
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id($cmp.chubu),
        },
        key: 3,
      }),
    ]),
    api_element(
      "h1",
      {
        attrs: {
          id: api_scoped_id("#narita"),
        },
        key: 4,
      },
      [api_text("Time to travel!")]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4s0jmj9uli4";
tmpl.legacyStylesheetToken =
  "x-attribute-href-with-id-expression_attribute-href-with-id-expression";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
