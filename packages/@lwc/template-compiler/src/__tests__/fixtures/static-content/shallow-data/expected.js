import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0 } = $ctx;
  return [
    api_static_fragment($fragment1(), 0, [
      api_static_part(0, {
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.onClick)),
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
