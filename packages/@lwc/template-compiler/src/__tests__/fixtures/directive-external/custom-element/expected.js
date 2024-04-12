import _implicitStylesheets from "./custom-element.css";
import _implicitScopedStylesheets from "./custom-element.scoped.css?scoped=true";
import _xTest from "x/test";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
  external: true,
};
const stc2 = {
  key: 2,
  external: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element("x-test", _xTest, stc0),
    api_element("x-test", stc1),
    api_element("foo-bar", stc2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-i4i43q1672";
tmpl.legacyStylesheetToken = "x-custom-element_custom-element";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
