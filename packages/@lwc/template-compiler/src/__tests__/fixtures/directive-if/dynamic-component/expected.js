import _implicitStylesheets from "./dynamic-component.css";
import _implicitScopedStylesheets from "./dynamic-component.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>2</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, dc: api_dynamic_component } = $api;
  return [
    $cmp.isTrue
      ? api_dynamic_component($cmp.ctor, stc0, [
          api_static_fragment($fragment1, 2),
        ])
      : null,
    !$cmp.isTrue2
      ? api_dynamic_component($cmp.ctor, stc1, [
          api_static_fragment($fragment2, 5),
        ])
      : null,
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2aur4v16kjs";
tmpl.legacyStylesheetToken = "x-dynamic-component_dynamic-component";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
