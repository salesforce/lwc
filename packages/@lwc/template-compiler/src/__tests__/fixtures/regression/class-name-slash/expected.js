import _implicitStylesheets from "./class-name-slash.css";
import _implicitScopedStylesheets from "./class-name-slash.scoped.css?scoped=true";
import _xCmp from "x/cmp";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    foo: true,
  },
  props: {
    xClass: "bar",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("x-cmp", _xCmp, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6uii8ct4jjg";
tmpl.legacyStylesheetToken = "x-class-name-slash_class-name-slash";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
