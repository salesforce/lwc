import _implicitStylesheets from "./definition-sibling-static.css";
import _implicitScopedStylesheets from "./definition-sibling-static.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Sibling</p>`;
const $fragment2 = parseFragment`<p${3}>Default slot content</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, s: api_slot, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_static_fragment($fragment1, 2),
      api_slot("", stc1, [api_static_fragment($fragment2, "@:5")], $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-5n9s7p96h6j";
tmpl.legacyStylesheetToken =
  "x-definition-sibling-static_definition-sibling-static";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
