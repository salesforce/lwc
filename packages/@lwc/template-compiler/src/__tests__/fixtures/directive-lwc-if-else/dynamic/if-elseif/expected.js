import _implicitStylesheets from "./if-elseif.css";
import _implicitScopedStylesheets from "./if-elseif.scoped.css?scoped=true";
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
      : $cmp.visible.elseif
        ? api_fragment(
            0,
            [
              api_deprecated_dynamic_component(
                "x-foo",
                $cmp.trackedProp.foo,
                stc0
              ),
            ],
            0
          )
        : null,
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-701s5vgen3k";
tmpl.legacyStylesheetToken = "x-if-elseif_if-elseif";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
