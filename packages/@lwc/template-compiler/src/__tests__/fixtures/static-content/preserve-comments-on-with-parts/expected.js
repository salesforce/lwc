import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><!-- comment --><button data-id="foo"${"a2:data-dynamic"}${"s2"}${3}>foo</button><!-- comment --><button data-id="bar"${"a5:data-dynamic"}${"s5"}${3}>bar</button></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        2,
        {
          on: {
            click: _m0 || ($ctx._m0 = api_bind($cmp.onClickFoo)),
          },
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
          on: {
            click: _m1 || ($ctx._m1 = api_bind($cmp.onClickBar)),
          },
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
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
