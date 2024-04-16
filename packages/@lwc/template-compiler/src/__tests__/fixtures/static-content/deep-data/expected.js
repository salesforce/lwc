import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${3}></div><div${3}></div><div${"a6:data-name"}${3}></div><div${"s7"}${3}></div><div${"c8"}${2}></div></div></div><div${3}></div><div${3}></div><div${"a11:data-name"}${3}></div><div${"s12"}${3}></div><div${"c13"}${2}></div></div>`;
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
    api_static_fragment($fragment1, 1, [
      api_static_part(4, stc0, null),
      api_static_part(
        5,
        {
          on: {
            click: _m0 || ($ctx._m0 = api_bind($cmp.onClickBaz)),
          },
        },
        null
      ),
      api_static_part(
        6,
        {
          attrs: {
            "data-name": $cmp.foo,
          },
        },
        null
      ),
      api_static_part(
        7,
        {
          style: $cmp.fooStyle,
        },
        null
      ),
      api_static_part(
        8,
        {
          className: $cmp.fooClass,
        },
        null
      ),
      api_static_part(9, stc1, null),
      api_static_part(
        10,
        {
          on: {
            click: _m1 || ($ctx._m1 = api_bind($cmp.onClickQuux)),
          },
        },
        null
      ),
      api_static_part(
        11,
        {
          attrs: {
            "data-name": $cmp.bar,
          },
        },
        null
      ),
      api_static_part(
        12,
        {
          style: $cmp.barStyle,
        },
        null
      ),
      api_static_part(
        13,
        {
          className: $cmp.barClass,
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
