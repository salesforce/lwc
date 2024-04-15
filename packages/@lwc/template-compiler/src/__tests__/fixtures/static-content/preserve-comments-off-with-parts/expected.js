import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><button data-id="foo"${"a1:data-dynamic"}${"s1"}${"c1"}${2}>foo</button><button data-id="bar"${"a3:data-dynamic"}${"s3"}${"c3"}${2}>bar</button></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        {
          on: {
            click: _m0 || ($ctx._m0 = api_bind($cmp.onClickFoo)),
          },
          ref: "foo",
          style: $cmp.fooStyle,
          className: $cmp.fooClass,
          attrs: {
            "data-dynamic": $cmp.foo,
          },
        },
        null
      ),
      api_static_part(
        3,
        {
          on: {
            click: _m1 || ($ctx._m1 = api_bind($cmp.onClickBar)),
          },
          ref: "bar",
          style: $cmp.barStyle,
          className: $cmp.barClass,
          attrs: {
            "data-dynamic": $cmp.bar,
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
