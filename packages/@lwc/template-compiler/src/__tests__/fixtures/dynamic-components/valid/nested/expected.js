import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>Inside the outer component</span>`;
const $fragment2 = parseFragment`<span${3}>Inside the nested component</span>`;
const stc0 = {
  "outer-style": true,
};
const stc1 = {
  myProp: "outer-prop",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    st: api_static_fragment,
    dc: api_dynamic_component,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_dynamic_component(
      $cmp.ctor1,
      {
        classMap: stc0,
        props: stc1,
        key: 0,
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.handleOuterClick)),
        },
      },
      [
        api_static_fragment($fragment1(), 2),
        api_dynamic_component(
          $cmp.ctor2,
          {
            classMap: stc0,
            props: stc1,
            key: 3,
            on: {
              click: _m1 || ($ctx._m1 = api_bind($cmp.handleOuterClick)),
            },
          },
          [api_static_fragment($fragment2(), 5)]
        ),
      ]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
