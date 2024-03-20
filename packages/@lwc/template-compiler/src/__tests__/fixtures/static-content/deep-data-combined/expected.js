import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${"a4:data-name"}${"s4:"}${3}></div></div></div><div${"a5:data-name"}${"s5:"}${3}></div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(4, {
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.onClickBaz)),
        },
        ref: "foo",
        style: $cmp.fooStyle,
        attrs: {
          "data-name": $cmp.foo,
        },
      }),
      api_static_part(5, {
        on: {
          click: _m1 || ($ctx._m1 = api_bind($cmp.onClickQuux)),
        },
        ref: "bar",
        style: $cmp.barStyle,
        attrs: {
          "data-name": $cmp.bar,
        },
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
