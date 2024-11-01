import _implicitStylesheets from "./html-input.css";
import _implicitScopedStylesheets from "./html-input.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input type="checkbox" required readonly minlength="5" maxlength="10"${3}>`;
const stc0 = {
  props: {
    checked: true,
  },
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1, [api_static_part(0, stc0, null)])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4dafm4d1lfh";
tmpl.legacyStylesheetToken = "x-html-input_html-input";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
