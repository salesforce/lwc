import _implicitStylesheets from "./tagname-no-attributes.css";
import _implicitScopedStylesheets from "./tagname-no-attributes.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate, renderer } from "lwc";
const stc0 = {
  city: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        classMap: stc0,
        key: 0,
        renderer: renderer,
      },
      [api_text("Should get custom renderer")]
    ),
    api_element(
      "div",
      {
        key: 1,
        renderer: renderer,
      },
      [api_text("Should also get custom renderer")]
    ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-15ubc3rrgkq";
tmpl.legacyStylesheetToken = "x-tagname-no-attributes_tagname-no-attributes";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
