import _implicitStylesheets from "./non-optimized.css";
import _implicitScopedStylesheets from "./non-optimized.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    "a`b`c": "",
  },
  key: 0,
};
const stc1 = {
  attrs: {
    "a`b`c": "yolo",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("div", stc0), api_element("div", stc1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-71tdq7g4m0k";
tmpl.legacyStylesheetToken = "x-non-optimized_non-optimized";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
