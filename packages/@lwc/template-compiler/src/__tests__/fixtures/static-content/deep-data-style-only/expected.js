import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${"s4"}${3}></div><div${"s5"}${3}></div></div></div><div${"s6"}${3}></div><div${"s7"}${3}></div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        4,
        {
          style: $cmp.foo,
        },
        null
      ),
      api_static_part(
        5,
        {
          style: $cmp.baz,
        },
        null
      ),
      api_static_part(
        6,
        {
          style: $cmp.bar,
        },
        null
      ),
      api_static_part(
        7,
        {
          style: $cmp.quux,
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
