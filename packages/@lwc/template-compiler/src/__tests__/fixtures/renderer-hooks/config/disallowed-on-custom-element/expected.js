import _implicitStylesheets from "./disallowed-on-custom-element.css";
import _implicitScopedStylesheets from "./disallowed-on-custom-element.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    c: api_custom_element,
    ddc: api_deprecated_dynamic_component,
    dc: api_dynamic_component,
  } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_deprecated_dynamic_component("x-foo", $cmp.dynamicCtor, stc1),
    api_dynamic_component($cmp.ctor, stc2),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4q030adgbk8";
tmpl.legacyStylesheetToken =
  "x-disallowed-on-custom-element_disallowed-on-custom-element";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
