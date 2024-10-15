import _implicitStylesheets from "./directive-for-each.css";
import _implicitScopedStylesheets from "./directive-for-each.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<li${3}>${"t1"}</li>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    co: api_comment,
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "ul",
      stc0,
      api_iterator($cmp.colors, function (color) {
        return [
          api_comment(" color "),
          api_static_fragment($fragment1, api_key(2, color), [
            api_static_part(1, null, api_dynamic_text(color)),
          ]),
        ];
      })
    ),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6fjo1bal55e";
tmpl.legacyStylesheetToken = "x-directive-for-each_directive-for-each";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
