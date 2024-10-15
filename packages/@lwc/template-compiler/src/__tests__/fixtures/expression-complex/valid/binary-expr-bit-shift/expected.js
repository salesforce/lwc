import _implicitStylesheets from "./binary-expr-bit-shift.css";
import _implicitScopedStylesheets from "./binary-expr-bit-shift.scoped.css?scoped=true";
import _xChild from "x/child";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-child", _xChild, {
        props: {
          attr: $cmp.foo >> $cmp.bar,
        },
        key: 1,
      }),
      api_custom_element("x-child", _xChild, {
        props: {
          attr: $cmp.foo << $cmp.bar,
        },
        key: 2,
      }),
      api_custom_element("x-child", _xChild, {
        props: {
          attr: $cmp.foo >>> $cmp.bar,
        },
        key: 3,
      }),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5p79c89e8dj";
tmpl.legacyStylesheetToken = "x-binary-expr-bit-shift_binary-expr-bit-shift";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
