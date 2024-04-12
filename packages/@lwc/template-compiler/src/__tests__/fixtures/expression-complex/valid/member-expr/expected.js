import _implicitStylesheets from "./member-expr.css";
import _implicitScopedStylesheets from "./member-expr.scoped.css?scoped=true";
import _xPert from "x/pert";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element(
        "x-pert",
        _xPert,
        {
          props: {
            attr: $cmp.foo.bar,
          },
          key: 1,
        },
        [api_text(api_dynamic_text($cmp.foo.bar.baz))]
      ),
      api_custom_element(
        "x-pert",
        _xPert,
        {
          props: {
            attr: $cmp.foo.bar,
          },
          key: 2,
        },
        [api_text(api_dynamic_text($cmp.biz.baz))]
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2a1sbir7isn";
tmpl.legacyStylesheetToken = "x-member-expr_member-expr";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
