import _implicitStylesheets from "./not-scoped.css";
import _implicitScopedStylesheets from "./not-scoped.scoped.css?scoped=true";
import _lightningCombobox from "lightning/combobox";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    ariaDescribedBy: "not-scoped-foo",
    ariaActiveDescendant: "not-scoped-foo",
    ariaErrorMessage: "not-scoped-foo",
    ariaFlowTo: "not-scoped-foo",
    ariaLabelledBy: "not-scoped-foo",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("lightning-combobox", _lightningCombobox, stc0)];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-68v9rhsbkkg";
tmpl.legacyStylesheetToken = "x-not-scoped_not-scoped";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
