import _implicitStylesheets from "./unary-expr-logical.css";
import _implicitScopedStylesheets from "./unary-expr-logical.scoped.css?scoped=true";
import _xPert from "x/pert";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-pert", _xPert, {
        props: {
          attr: !$cmp.foo,
        },
        key: 1,
      }),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1s8kdgpsntb";
tmpl.legacyStylesheetToken = "x-unary-expr-logical_unary-expr-logical";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
