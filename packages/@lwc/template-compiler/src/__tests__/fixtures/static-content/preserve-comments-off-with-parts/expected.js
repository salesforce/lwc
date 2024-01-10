import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><button data-id="foo"${3}>foo</button><button data-id="bar"${3}>bar</button></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1(), 1, [
      api_static_part(1, {
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.onClickFoo)),
        },
        ref: "foo",
      }),
      api_static_part(3, {
        on: {
          click: _m1 || ($ctx._m1 = api_bind($cmp.onClickBar)),
        },
        ref: "bar",
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
