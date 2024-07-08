import _implicitStylesheets from "./attribute-href-expression.css";
import _implicitScopedStylesheets from "./attribute-href-expression.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a${"a0:href"}${3}>KIX</a>`;
const $fragment2 = parseFragment`<map${3}><area${"a1:href"}${3}><area${"a2:href"}${3}></map>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          attrs: {
            href: $cmp.narita,
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
            href: $cmp.haneda,
          },
        },
        null
      ),
      api_static_part(
        2,
        {
          attrs: {
            href: $cmp.chubu,
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
