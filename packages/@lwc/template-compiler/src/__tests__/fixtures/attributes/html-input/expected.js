import _implicitStylesheets from "./html-input.css";
import _implicitScopedStylesheets from "./html-input.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    type: "checkbox",
    required: "",
    readonly: "",
    minlength: "5",
    maxlength: "10",
  },
  props: {
    checked: true,
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("input", stc0)];
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
