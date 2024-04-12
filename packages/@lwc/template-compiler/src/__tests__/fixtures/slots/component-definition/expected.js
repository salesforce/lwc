import _implicitStylesheets from "./component-definition.css";
import _implicitScopedStylesheets from "./component-definition.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, c: api_custom_element } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0, [
      api_slot("", stc1, stc2, $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5kp75peq61d";
tmpl.legacyStylesheetToken = "x-component-definition_component-definition";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
