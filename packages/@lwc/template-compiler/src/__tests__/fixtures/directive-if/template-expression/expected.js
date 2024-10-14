import _implicitStylesheets from "./template-expression.css";
import _implicitScopedStylesheets from "./template-expression.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      $cmp.state.isTrue
        ? api_text(
            api_dynamic_text($cmp.foo) + " " + api_dynamic_text($cmp.bar)
          )
        : null,
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5uvenajcmlb";
tmpl.legacyStylesheetToken = "x-template-expression_template-expression";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
