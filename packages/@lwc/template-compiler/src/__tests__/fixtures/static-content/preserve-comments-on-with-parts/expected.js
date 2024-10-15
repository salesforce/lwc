import _implicitStylesheets from "./preserve-comments-on-with-parts.css";
import _implicitScopedStylesheets from "./preserve-comments-on-with-parts.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><!-- comment --><button data-id="foo"${"a2:data-dynamic"}${"s2"}${3}>foo</button><!-- comment --><button data-id="bar"${"a5:data-dynamic"}${"s5"}${3}>bar</button></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        2,
        {
          on:
            _m0 ||
            ($ctx._m0 = {
              click: api_bind($cmp.onClickFoo),
            }),
          ref: "foo",
          style: $cmp.fooStyle,
          attrs: {
            "data-dynamic": $cmp.foo,
          },
        },
        null
      ),
      api_static_part(
        5,
        {
          on:
            _m1 ||
            ($ctx._m1 = {
              click: api_bind($cmp.onClickBar),
            }),
          ref: "bar",
          style: $cmp.barStyle,
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
tmpl.stylesheetToken = "lwc-2hhaie9eb6e";
tmpl.legacyStylesheetToken =
  "x-preserve-comments-on-with-parts_preserve-comments-on-with-parts";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
