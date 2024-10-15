import _implicitStylesheets from "./duplicate-props.css";
import _implicitScopedStylesheets from "./duplicate-props.scoped.css?scoped=true";
import _nsBaz1 from "ns/baz1";
import _nsBaz2 from "ns/baz2";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    accessKey: "with-hyphen",
  },
  key: 0,
};
const stc1 = {
  props: {
    accessKey: "without-hyphen",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("ns-baz-1", _nsBaz1, stc0),
    api_custom_element("ns-baz-2", _nsBaz2, stc1),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2tn6o48t2v1";
tmpl.legacyStylesheetToken = "x-duplicate-props_duplicate-props";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
