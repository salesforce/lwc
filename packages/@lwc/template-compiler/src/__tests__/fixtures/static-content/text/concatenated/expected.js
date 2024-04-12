import _implicitStylesheets from "./concatenated.css";
import _implicitScopedStylesheets from "./concatenated.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>${"t1"}</span>`;
const $fragment2 = parseFragment`<span${3}>${"t1"}</span>`;
const $fragment3 = parseFragment`<span${3}>${"t1"}</span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        null,
        "I am the " + api_dynamic_text($cmp.cookieMonster) + ", fear me!"
      ),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(
        1,
        null,
        api_dynamic_text($cmp.beginning) + " of string concat"
      ),
    ]),
    api_static_fragment($fragment3, 5, [
      api_static_part(
        1,
        null,
        "Expression at the " + api_dynamic_text($cmp.end)
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2mft3qo9a2t";
tmpl.legacyStylesheetToken = "x-concatenated_concatenated";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
