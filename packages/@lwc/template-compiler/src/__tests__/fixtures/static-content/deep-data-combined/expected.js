import _implicitStylesheets from "./deep-data-combined.css";
import _implicitScopedStylesheets from "./deep-data-combined.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${"a4:data-name"}${"s4"}${3}>${"t5"}</div></div></div><div${"a6:data-name"}${"s6"}${3}>${"t7"}</div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  const { _m0, _m1, _m2, _m3 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        4,
        {
          on:
            $ctx._m1 ||
            ($ctx._m1 = {
              click: _m0 || ($ctx._m0 = api_bind($cmp.onClickBaz)),
            }),
          ref: "foo",
          style: $cmp.fooStyle,
          attrs: {
            "data-name": $cmp.foo,
          },
        },
        null
      ),
      api_static_part(5, null, "dynamic text " + api_dynamic_text($cmp.foo)),
      api_static_part(
        6,
        {
          on:
            $ctx._m3 ||
            ($ctx._m3 = {
              click: _m2 || ($ctx._m2 = api_bind($cmp.onClickQuux)),
            }),
          ref: "bar",
          style: $cmp.barStyle,
          attrs: {
            "data-name": $cmp.bar,
          },
        },
        null
      ),
      api_static_part(7, null, "dynamic text " + api_dynamic_text($cmp.bar)),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.hasRefs = true;
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2ekql9nb2jd";
tmpl.legacyStylesheetToken = "x-deep-data-combined_deep-data-combined";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
