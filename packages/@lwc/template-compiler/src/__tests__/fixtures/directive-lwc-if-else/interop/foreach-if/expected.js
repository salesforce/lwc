import _implicitStylesheets from "./foreach-if.css";
import _implicitScopedStylesheets from "./foreach-if.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, i: api_iterator, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(
          0,
          api_iterator($cmp.items, function (item) {
            return api_text("Conditional Iteration");
          }),
          0
        )
      : api_fragment(
          0,
          api_iterator($cmp.altItems, function (item) {
            return api_text("Else Iteration");
          }),
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-s9adiv6ieg";
tmpl.legacyStylesheetToken = "x-foreach-if_foreach-if";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
