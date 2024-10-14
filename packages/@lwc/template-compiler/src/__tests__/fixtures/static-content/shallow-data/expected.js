import _implicitStylesheets from "./shallow-data.css";
import _implicitScopedStylesheets from "./shallow-data.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${"a0:data-name"}${"s0"}${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          on:
            _m1 ||
            ($ctx._m1 = {
              click: api_bind($cmp.onClick),
            }),
          ref: "foo",
          style: $cmp.fooStyle,
          attrs: {
            "data-name": $cmp.foo,
          },
        },
        null
      ),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.hasRefs = true;
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1li76rtl7bn";
tmpl.legacyStylesheetToken = "x-shallow-data_shallow-data";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
