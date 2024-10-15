import _implicitStylesheets from "./preserve-comments-disabled.css";
import _implicitScopedStylesheets from "./preserve-comments-disabled.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_text("Conditional Text")], 0)
      : api_fragment(0, [api_text("Else!")], 0),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2gme9b0kobe";
tmpl.legacyStylesheetToken =
  "x-preserve-comments-disabled_preserve-comments-disabled";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
