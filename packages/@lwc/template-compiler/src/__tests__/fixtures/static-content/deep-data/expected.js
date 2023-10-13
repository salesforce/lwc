import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}></div>`;
const $fragment2 = parseFragment`<div${3}></div>`;
const $fragment3 = parseFragment`<div${3}></div>`;
const $fragment4 = parseFragment`<div${3}></div>`;
const $fragment5 = parseFragment`<div${3}></div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
};
const stc2 = {
  key: 4,
};
const stc3 = {
  ref: "foo",
};
const stc4 = {
  ref: "bar",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, b: api_bind, h: api_element } = $api;
  const { _m0, _m1, _m2, _m3 } = $ctx;
  return [
    api_element("div", stc0, [
      api_static_fragment($fragment1(), 2),
      api_element("div", stc1, [
        api_element("div", stc2, [
          api_static_fragment($fragment2(), 6, stc3),
          api_static_fragment($fragment3(), 8, {
            on: {
              click: _m1 || ($ctx._m1 = api_bind($cmp.onClickBaz)),
            },
          }),
        ]),
      ]),
      api_static_fragment($fragment4(), 10, stc4),
      api_static_fragment($fragment5(), 12, {
        on: {
          click: _m3 || ($ctx._m3 = api_bind($cmp.onClickQuux)),
        },
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
