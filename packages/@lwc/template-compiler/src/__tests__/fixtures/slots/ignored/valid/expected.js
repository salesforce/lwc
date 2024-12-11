import _implicitStylesheets from "./valid.css";
import _implicitScopedStylesheets from "./valid.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  slotAssignment: "bar",
  key: 2,
};
const stc3 = {
  key: 3,
  external: true,
};
const stc4 = {
  slotAssignment: "foo",
  key: 4,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, c: api_custom_element, t: api_text } = $api;
  return [
    api_element("div", stc0, [
      api_custom_element("x-foo", _xFoo, stc1, [api_element("span", stc2)]),
    ]),
    api_element("x-external", stc3, [
      api_element("div", stc4, [api_text("I am the foo slot")]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2jeqhu792ub";
tmpl.legacyStylesheetToken = "x-valid_valid";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
