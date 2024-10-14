import _implicitStylesheets from "./attribute-with-equal.css";
import _implicitScopedStylesheets from "./attribute-with-equal.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div props="{url: https://example.com/over/there?name=ferret}"${3}></div>`;
const stc0 = {
  props: {
    props: "{url: https://example.com/over/there?name=ferret}",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, st: api_static_fragment } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_static_fragment($fragment1, 2),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7uumbeenlgi";
tmpl.legacyStylesheetToken = "x-attribute-with-equal_attribute-with-equal";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
