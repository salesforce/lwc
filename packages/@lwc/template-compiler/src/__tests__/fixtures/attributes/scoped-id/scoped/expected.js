import _implicitStylesheets from "./scoped.css";
import _implicitScopedStylesheets from "./scoped.scoped.css?scoped=true";
import _lightningCombobox from "lightning/combobox";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element } = $api;
  return [
    api_custom_element("lightning-combobox", _lightningCombobox, {
      props: {
        ariaDescribedBy: api_scoped_id("scoped-foo"),
        ariaActiveDescendant: api_scoped_id("scoped-foo"),
        ariaErrorMessage: api_scoped_id("scoped-foo"),
        ariaFlowTo: api_scoped_id("scoped-foo"),
        ariaLabelledBy: api_scoped_id("scoped-foo"),
        ariaControls: api_scoped_id("scoped-foo"),
        ariaDetails: api_scoped_id("scoped-foo"),
        ariaOwns: api_scoped_id("scoped-foo"),
        htmlFor: api_scoped_id("scoped-foo"),
      },
      key: 0,
    }),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-8anf07i38v";
tmpl.legacyStylesheetToken = "x-scoped_scoped";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
