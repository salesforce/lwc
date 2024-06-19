import _implicitStylesheets from "./nested.css";
import _implicitScopedStylesheets from "./nested.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><span${3}>some  text</span><div${3}>${"t5"}<span${3}>${"t7"}</span><div${3}>${"t9"}</div></div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        5,
        null,
        api_dynamic_text($cmp.dynamic) + " " + " " + api_dynamic_text($cmp.text)
      ),
      api_static_part(7, null, " " + api_dynamic_text($cmp.dynamic) + " text"),
      api_static_part(9, null, "text " + " " + api_dynamic_text($cmp.dynamic)),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-ud1n1pkbjc";
tmpl.legacyStylesheetToken = "x-nested_nested";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
