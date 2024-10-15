import _implicitStylesheets from "./used-attrs.css";
import _implicitScopedStylesheets from "./used-attrs.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><p${3}>${"t2"}</p></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(2, null, api_dynamic_text($cmp.obj.sub)),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-46132jpta3a";
tmpl.legacyStylesheetToken = "x-used-attrs_used-attrs";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
