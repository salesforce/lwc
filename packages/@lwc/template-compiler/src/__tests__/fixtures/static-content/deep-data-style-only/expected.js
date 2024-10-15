import _implicitStylesheets from "./deep-data-style-only.css";
import _implicitScopedStylesheets from "./deep-data-style-only.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${"s4"}${3}></div><div${"s5"}${3}></div></div></div><div${"s6"}${3}></div><div${"s7"}${3}></div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        4,
        {
          style: $cmp.foo,
        },
        null
      ),
      api_static_part(
        5,
        {
          style: $cmp.baz,
        },
        null
      ),
      api_static_part(
        6,
        {
          style: $cmp.bar,
        },
        null
      ),
      api_static_part(
        7,
        {
          style: $cmp.quux,
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2lh7nra2au0";
tmpl.legacyStylesheetToken = "x-deep-data-style-only_deep-data-style-only";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
