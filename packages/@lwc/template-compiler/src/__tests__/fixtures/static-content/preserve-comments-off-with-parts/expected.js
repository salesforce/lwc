import _implicitStylesheets from "./preserve-comments-off-with-parts.css";
import _implicitScopedStylesheets from "./preserve-comments-off-with-parts.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><button data-id="foo"${"a1:data-dynamic"}${"s1"}${"c1"}${2}>foo</button><button data-id="bar"${"a3:data-dynamic"}${"s3"}${"c3"}${2}>bar</button></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    ncls: api_normalize_class_name,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        {
          on:
            _m0 ||
            ($ctx._m0 = {
              click: api_bind($cmp.onClickFoo),
            }),
          ref: "foo",
          style: $cmp.fooStyle,
          className: api_normalize_class_name($cmp.fooClass),
          attrs: {
            "data-dynamic": $cmp.foo,
          },
        },
        null
      ),
      api_static_part(
        3,
        {
          on:
            _m1 ||
            ($ctx._m1 = {
              click: api_bind($cmp.onClickBar),
            }),
          ref: "bar",
          style: $cmp.barStyle,
          className: api_normalize_class_name($cmp.barClass),
          attrs: {
            "data-dynamic": $cmp.bar,
          },
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.hasRefs = true;
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-vgq39e7dj1";
tmpl.legacyStylesheetToken =
  "x-preserve-comments-off-with-parts_preserve-comments-off-with-parts";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
