import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><div${3}>x</div><div${3}>x</div></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, sp: api_static_part, st: api_static_fragment } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1(), 1, [
      api_static_part(1, {
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
        },
      }),
      api_static_part(3, {
        on: {
          press: _m1 || ($ctx._m1 = api_bind($cmp.handlePress)),
        },
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
