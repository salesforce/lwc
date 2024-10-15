import _implicitStylesheets from "./valid-non-alphanumeric.css";
import _implicitScopedStylesheets from "./valid-non-alphanumeric.scoped.css?scoped=true";
import _xButton from "x/button";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    nåna: "nana",
  },
  key: 0,
};
const stc1 = {
  props: {
    $leading: "bar",
  },
  key: 1,
};
const stc2 = {
  props: {
    _leading: "bar",
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
tmpl.stylesheetToken = "lwc-7m0fdesmolf";
tmpl.legacyStylesheetToken = "x-valid-non-alphanumeric_valid-non-alphanumeric";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
