import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}>${"t1"}</section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          on: {
            click: _m1 || ($ctx._m1 = api_bind($cmp.bar.arr[$cmp.baz])),
          },
        },
        null
      ),
      api_static_part(
        1,
        null,
        api_dynamic_text($cmp.bar.arr[$cmp.baz]) +
          " " +
          api_dynamic_text($cmp.bar.baz.arr[$cmp.quux]) +
          " " +
          api_dynamic_text($cmp.bar.arr[$cmp.baz.quux])
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
