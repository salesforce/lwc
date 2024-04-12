import _implicitStylesheets from "./attribute-uppercase.css";
import _implicitScopedStylesheets from "./attribute-uppercase.scoped.css?scoped=true";
import _xButton from "x/button";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    Class: "r",
    DataXx: "foo",
    AriaHidden: "hidden",
    Role: "xx",
    FooBar: "x",
    FooZaz: "z",
    Foo_bar_baz: "baz",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("x-button", _xButton, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-uguh0pjd13";
tmpl.legacyStylesheetToken = "x-attribute-uppercase_attribute-uppercase";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
