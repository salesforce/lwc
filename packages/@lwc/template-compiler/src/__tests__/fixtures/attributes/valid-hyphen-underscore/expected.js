import _implicitStylesheets from "./valid-hyphen-underscore.css";
import _implicitScopedStylesheets from "./valid-hyphen-underscore.scoped.css?scoped=true";
import _xButton from "x/button";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    under_hyphen: "bar",
  },
  key: 0,
};
const stc1 = {
  props: {
    foo_Bar: "bar",
  },
  key: 1,
};
const stc2 = {
  props: {
    Foo_Bar: "bar",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-button", _xButton, stc0),
    api_custom_element("x-button", _xButton, stc1),
    api_custom_element("x-button", _xButton, stc2),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-52sd2331v5c";
tmpl.legacyStylesheetToken =
  "x-valid-hyphen-underscore_valid-hyphen-underscore";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
