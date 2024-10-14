import _implicitStylesheets from "./siblings.css";
import _implicitScopedStylesheets from "./siblings.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><!-- front -->${"t2"}<span${3}><!-- inner front -->${"t5"}</span>${"t6"}<!-- middle --> text<span${3}>${"t10"}<!-- inner middle --> text</span>${"t13"}<!-- end --><span${3}>${"t16"}<!-- inner end --></span></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        2,
        null,
        " some " + api_dynamic_text($cmp.dynamic) + " text"
      ),
      api_static_part(5, null, " " + api_dynamic_text($cmp.dynamic) + " text"),
      api_static_part(6, null, "some " + api_dynamic_text($cmp.dynamic) + " "),
      api_static_part(10, null, "some " + api_dynamic_text($cmp.dynamic) + " "),
      api_static_part(
        13,
        null,
        "some " + api_dynamic_text($cmp.dynamic) + " text "
      ),
      api_static_part(
        16,
        null,
        "some " + api_dynamic_text($cmp.dynamic) + " text "
      ),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1f6gdeblibr";
tmpl.legacyStylesheetToken = "x-siblings_siblings";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
