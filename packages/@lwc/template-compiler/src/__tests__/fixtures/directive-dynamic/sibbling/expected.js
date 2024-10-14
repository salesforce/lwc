import _implicitStylesheets from "./sibbling.css";
import _implicitScopedStylesheets from "./sibbling.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>before</div>`;
const $fragment2 = parseFragment`<div${3}>after</div>`;
const stc0 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, ddc: api_deprecated_dynamic_component } =
    $api;
  return [
    api_static_fragment($fragment1, 1),
    api_deprecated_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
    api_static_fragment($fragment2, 4),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-3gcvleqa6si";
tmpl.legacyStylesheetToken = "x-sibbling_sibbling";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
