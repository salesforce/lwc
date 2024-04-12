import _implicitStylesheets from "./template.css";
import _implicitScopedStylesheets from "./template.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_text("Conditional Text")], 0)
      : $cmp.elseifCondition
      ? api_fragment(0, [api_text("Elseif!")], 0)
      : api_fragment(0, [api_text("Else!")], 0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2it5vhebv0i";
tmpl.legacyStylesheetToken = "x-template_template";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
