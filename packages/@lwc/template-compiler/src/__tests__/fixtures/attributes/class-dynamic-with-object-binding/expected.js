import _implicitStylesheets from "./class-dynamic-with-object-binding.css";
import _implicitScopedStylesheets from "./class-dynamic-with-object-binding.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${"c0"}${2}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    ncls: api_normalize_class_name,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          className: api_normalize_class_name($cmp.computed),
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-agbrffqjb4";
tmpl.legacyStylesheetToken =
  "x-class-dynamic-with-object-binding_class-dynamic-with-object-binding";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
