import _implicitStylesheets from "./attribute.css";
import _implicitScopedStylesheets from "./attribute.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><p${"c1"}${2}></p></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    ncls: api_normalize_class_name,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        {
          className: api_normalize_class_name($cmp.bar),
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4sr9e6p0fgr";
tmpl.legacyStylesheetToken = "x-attribute_attribute";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
