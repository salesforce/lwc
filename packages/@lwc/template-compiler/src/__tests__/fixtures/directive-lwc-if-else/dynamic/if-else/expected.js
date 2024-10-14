import _implicitStylesheets from "./if-else.css";
import _implicitScopedStylesheets from "./if-else.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>if condition</h1>`;
const stc0 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    fr: api_fragment,
    ddc: api_deprecated_dynamic_component,
  } = $api;
  return [
    $cmp.visible.if
      ? api_fragment(0, [api_static_fragment($fragment1, 2)], 0)
      : api_fragment(
          0,
          [
            api_deprecated_dynamic_component(
              "x-foo",
              $cmp.trackedProp.foo,
              stc0
            ),
          ],
          0
        ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-59e6ud6dj78";
tmpl.legacyStylesheetToken = "x-if-else_if-else";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
