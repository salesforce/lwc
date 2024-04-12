import _implicitStylesheets from "./keygen.css";
import _implicitScopedStylesheets from "./keygen.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input type="text"${3}>`;
const $fragment2 = parseFragment`<keygen name="name" challenge="some challenge" keytype="type" keyparams="some-params"${3}>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, t: api_text } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_text("</input>"),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1tm45udomu6";
tmpl.legacyStylesheetToken = "x-keygen_keygen";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
