import _implicitStylesheets from "./if-elseif-multiple.css";
import _implicitScopedStylesheets from "./if-elseif-multiple.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>if condition</h1>`;
const $fragment2 = parseFragment`<h1${3}>elseif condition</h1>`;
const $fragment3 = parseFragment`<h1${3}>else condition</h1>`;
const stc0 = {
  key: 5,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    fr: api_fragment,
    dc: api_dynamic_component,
  } = $api;
  return [
    $cmp.visible.if
      ? api_fragment(0, [api_static_fragment($fragment1, 2)], 0)
      : $cmp.visible.elseif
        ? api_fragment(0, [api_static_fragment($fragment2, 4)], 0)
        : $cmp.visible.elseif2
          ? api_fragment(
              0,
              [api_dynamic_component($cmp.trackedProp.foo, stc0)],
              0
            )
          : api_fragment(0, [api_static_fragment($fragment3, 7)], 0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4ht1tjprfr4";
tmpl.legacyStylesheetToken = "x-if-elseif-multiple_if-elseif-multiple";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
