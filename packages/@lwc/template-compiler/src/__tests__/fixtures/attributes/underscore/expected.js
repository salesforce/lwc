import _implicitStylesheets from "./underscore.css";
import _implicitScopedStylesheets from "./underscore.scoped.css?scoped=true";
import _xButton from "x/button";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    under_score: "bar",
  },
  key: 0,
};
const stc1 = {
  props: {
    under_1: "bar",
  },
  key: 1,
};
const stc2 = {
  props: {
    under_scoreHyphen: "bar",
  },
  key: 2,
};
const stc3 = {
  props: {
    under_scoreSecond_underScore: "bar",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-button", _xButton, stc0),
    api_custom_element("x-button", _xButton, stc1),
    api_custom_element("x-button", _xButton, stc2),
    api_custom_element("x-button", _xButton, stc3),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5b02te4b5vj";
tmpl.legacyStylesheetToken = "x-underscore_underscore";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
