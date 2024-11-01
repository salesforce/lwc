import _implicitStylesheets from "./preserve-comments.css";
import _implicitScopedStylesheets from "./preserve-comments.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    co: api_comment,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
  } = $api;
  return [
    api_element("span", stc0, [
      api_comment(" yolo "),
      api_text(api_dynamic_text($cmp.foo)),
      api_comment(" yolo "),
      api_text(api_dynamic_text($cmp.bar)),
      api_comment(" yolo "),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-332m459dd46";
tmpl.legacyStylesheetToken = "x-preserve-comments_preserve-comments";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
