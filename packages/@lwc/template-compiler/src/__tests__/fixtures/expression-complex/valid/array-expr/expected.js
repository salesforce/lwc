import _implicitStylesheets from "./array-expr.css";
import _implicitScopedStylesheets from "./array-expr.scoped.css?scoped=true";
import _xPert from "x/pert";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    c: api_custom_element,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-pert", _xPert, {
        props: {
          foo: [1, $cmp.bar, "baz"],
        },
        key: 1,
      }),
      api_text(api_dynamic_text(["flop", $cmp.floo, 2].join(""))),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4905ctci1tk";
tmpl.legacyStylesheetToken = "x-array-expr_array-expr";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
