import _implicitStylesheets from "./html-elements.css";
import _implicitScopedStylesheets from "./html-elements.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}></h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_static_fragment($fragment1, 2)], 0)
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5n98hcrisnv";
tmpl.legacyStylesheetToken = "x-html-elements_html-elements";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
