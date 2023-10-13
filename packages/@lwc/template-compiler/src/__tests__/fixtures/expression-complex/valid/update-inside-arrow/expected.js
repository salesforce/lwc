import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<button${3}></button>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, st: api_static_fragment, h: api_element } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_element("section", stc0, [
      api_static_fragment($fragment1(), 2, {
        on: {
          click: _m1 || ($ctx._m1 = api_bind(() => $cmp.$cmp.foo++)),
        },
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
