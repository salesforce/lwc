import _implicitStylesheets from "./excaped-json.css";
import _implicitScopedStylesheets from "./excaped-json.scoped.css?scoped=true";
import _xTest from "x/test";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    json: '[{"column":"ID","value":"5e","operator":"equals","f":true}]',
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("x-test", _xTest, stc0)];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2mip20h8vh2";
tmpl.legacyStylesheetToken = "x-excaped-json_excaped-json";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
