import _implicitStylesheets from "./dynamic-ref.css";
import _implicitScopedStylesheets from "./dynamic-ref.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${"a0:dynamic"}${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          ref: "foo",
          attrs: {
            dynamic: $cmp.dynamic,
          },
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.hasRefs = true;
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-rok9vrf83v";
tmpl.legacyStylesheetToken = "x-dynamic-ref_dynamic-ref";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
