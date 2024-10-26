import _implicitStylesheets from "./ignored-warning.css";
import _implicitScopedStylesheets from "./ignored-warning.scoped.css?scoped=true";
import _xInner from "x/inner";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  slotAssignment: "foo",
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, c: api_custom_element } = $api;
  return [
    api_custom_element("x-inner", _xInner, stc0, [
      api_element("div", stc1, [
        api_element("span", stc2, [api_text("I am the foo slot")]),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4q5hvj892j4";
tmpl.legacyStylesheetToken = "x-ignored-warning_ignored-warning";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
