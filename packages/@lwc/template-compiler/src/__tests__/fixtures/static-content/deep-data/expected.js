import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${3}></div><div${3}></div><div${"a6:data-name"}${3}></div></div></div><div${3}></div><div${3}></div><div${"a9:data-name"}${3}></div></div>`;
const stc0 = {
  ref: "foo",
};
const stc1 = {
  ref: "bar",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 0, [
      api_static_part(4, stc0),
      api_static_part(5, {
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.onClickBaz)),
        },
      }),
      api_static_part(6, {
        attrs: {
          "data-name": $cmp.bar,
        },
      }),
      api_static_part(7, stc1),
      api_static_part(8, {
        on: {
          click: _m1 || ($ctx._m1 = api_bind($cmp.onClickQuux)),
        },
      }),
      api_static_part(9, {
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
