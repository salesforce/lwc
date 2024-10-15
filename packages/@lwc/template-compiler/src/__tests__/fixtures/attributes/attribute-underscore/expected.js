import _implicitStylesheets from "./attribute-underscore.css";
import _implicitScopedStylesheets from "./attribute-underscore.scoped.css?scoped=true";
import _xButton from "x/button";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    foo__bar: "underscore",
  },
  key: 0,
};
const stc1 = {
  props: {
    foo__3ar: "underscore",
  },
  key: 1,
};
const stc2 = {
  props: {
    fo0__bar: "underscore",
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
tmpl.stylesheetToken = "lwc-36q7c97l1ni";
tmpl.legacyStylesheetToken = "x-attribute-underscore_attribute-underscore";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
