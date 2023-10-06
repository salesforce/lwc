import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1(), 1, [
      api_static_part(0, {
        on: {
          click: _m1 || ($ctx._m1 = api_bind($cmp.onClick)),
        },
        ref: "foo",
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
