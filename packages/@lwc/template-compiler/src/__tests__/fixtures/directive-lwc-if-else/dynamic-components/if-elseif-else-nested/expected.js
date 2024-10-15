import _implicitStylesheets from "./if-elseif-else-nested.css";
import _implicitScopedStylesheets from "./if-elseif-else-nested.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>outer if</h1>`;
const $fragment2 = parseFragment`<h1${3}>outer elseif</h1>`;
const $fragment3 = parseFragment`<h1${3}>inner if</h1>`;
const $fragment4 = parseFragment`<h1${3}>inner elseif</h1>`;
const $fragment5 = parseFragment`<h1${3}>inner else</h1>`;
const $fragment6 = parseFragment`<h1${3}>outer else</h1>`;
const stc0 = {
  key: 10,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    fr: api_fragment,
    dc: api_dynamic_component,
  } = $api;
  return [
    $cmp.outer.if
      ? api_fragment(0, [api_static_fragment($fragment1, 2)], 0)
      : $cmp.outer.elseif1
        ? api_fragment(0, [api_static_fragment($fragment2, 4)], 0)
        : $cmp.outer.elseif2
          ? api_fragment(
              0,
              [
                $cmp.inner.if
                  ? api_fragment(5, [api_static_fragment($fragment3, 7)], 0)
                  : $cmp.inner.elseif
                    ? api_fragment(5, [api_static_fragment($fragment4, 9)], 0)
                    : $cmp.inner.elseif2
                      ? api_fragment(
                          5,
                          [api_dynamic_component($cmp.trackedProp.foo, stc0)],
                          0
                        )
                      : api_fragment(
                          5,
                          [api_static_fragment($fragment5, 12)],
                          0
                        ),
              ],
              0
            )
          : api_fragment(0, [api_static_fragment($fragment6, 14)], 0),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2ejbkifb08c";
tmpl.legacyStylesheetToken = "x-if-elseif-else-nested_if-elseif-else-nested";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
