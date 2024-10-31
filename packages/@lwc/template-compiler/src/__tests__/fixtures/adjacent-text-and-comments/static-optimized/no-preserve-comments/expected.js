import _implicitStylesheets from "./no-preserve-comments.css";
import _implicitScopedStylesheets from "./no-preserve-comments.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>${"t1"}</span>`;
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
        api_dynamic_text($cmp.foo) + api_dynamic_text($cmp.bar)
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-351u0g5gdss";
tmpl.legacyStylesheetToken = "x-no-preserve-comments_no-preserve-comments";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
