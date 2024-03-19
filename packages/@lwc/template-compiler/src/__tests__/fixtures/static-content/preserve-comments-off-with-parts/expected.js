import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><button data-id="foo"${"a1:data-dynamic"}${3}>foo</button><button data-id="bar"${"a3:data-dynamic"}${3}>bar</button></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(1, {
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.onClickFoo)),
        },
        ref: "foo",
        attrs: {
          "data-dynamic": $cmp.foo,
        },
      }),
      api_static_part(3, {
        on: {
          click: _m1 || ($ctx._m1 = api_bind($cmp.onClickBar)),
        },
        ref: "bar",
        attrs: {
          "data-dynamic": $cmp.bar,
        },
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
