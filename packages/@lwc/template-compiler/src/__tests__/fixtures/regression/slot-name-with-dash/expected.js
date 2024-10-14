import _implicitStylesheets from "./slot-name-with-dash.css";
import _implicitScopedStylesheets from "./slot-name-with-dash.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Test slot content</p>`;
const stc0 = {
  attrs: {
    name: "secret-slot",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, s: api_slot } = $api;
  return [
    api_slot(
      "secret-slot",
      stc0,
      [api_static_fragment($fragment1, "@secret-slot:2")],
      $slotset
    ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["secret-slot"];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-69tppsdg3l4";
tmpl.legacyStylesheetToken = "x-slot-name-with-dash_slot-name-with-dash";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
