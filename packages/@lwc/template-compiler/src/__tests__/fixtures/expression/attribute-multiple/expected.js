import _implicitStylesheets from "./attribute-multiple.css";
import _implicitScopedStylesheets from "./attribute-multiple.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${"c0"}${2}><p${"c1"}${2}></p></section>`;
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
          className: api_normalize_class_name
            ? api_normalize_class_name($cmp.foo.c)
            : $cmp.foo.c,
        },
        null
      ),
      api_static_part(
        1,
        {
          className: api_normalize_class_name
            ? api_normalize_class_name($cmp.bar.c)
            : $cmp.bar.c,
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3qo8eqopgq6";
tmpl.legacyStylesheetToken = "x-attribute-multiple_attribute-multiple";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
