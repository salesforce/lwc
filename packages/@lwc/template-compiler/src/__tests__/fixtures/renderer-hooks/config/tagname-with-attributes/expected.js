import _implicitStylesheets from "./tagname-with-attributes.css";
import _implicitScopedStylesheets from "./tagname-with-attributes.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate, renderer } from "lwc";
const $fragment1 = parseFragment`<div${3}>Should not get custom renderer</div>`;
const stc0 = {
  city: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, st: api_static_fragment } = $api;
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
    api_static_fragment($fragment1, 2),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-mfnbsc228l";
tmpl.legacyStylesheetToken =
  "x-tagname-with-attributes_tagname-with-attributes";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
