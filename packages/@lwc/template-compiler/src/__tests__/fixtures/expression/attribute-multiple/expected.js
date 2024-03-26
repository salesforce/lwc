import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${"c0"}${2}><p${"c1"}${2}></p></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          className: $cmp.foo.c,
        },
        null
      ),
      api_static_part(
        1,
        {
          className: $cmp.bar.c,
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
