import _implicitStylesheets from "./attribute-href-expression.css";
import _implicitScopedStylesheets from "./attribute-href-expression.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "a",
      {
        attrs: {
          href: $cmp.narita,
        },
        key: 0,
      },
      [api_text("KIX")]
    ),
    api_element("map", stc0, [
      api_element("area", {
        attrs: {
          href: $cmp.haneda,
        },
        key: 2,
      }),
      api_element("area", {
        attrs: {
          href: $cmp.chubu,
        },
        key: 3,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7ng244mf2sm";
tmpl.legacyStylesheetToken =
  "x-attribute-href-expression_attribute-href-expression";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
