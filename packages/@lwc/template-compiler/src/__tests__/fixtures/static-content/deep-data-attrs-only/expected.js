import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}></div><div${3}><div${3}><div${"a4:data-name"}${3}></div><div${"a5:data-name"}${3}></div></div></div><div${"a6:data-name"}${3}></div><div${"a7:data-name"}${3}></div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 0, [
      api_static_part(4, {
        attrs: {
          "data-name": $cmp.foo,
        },
      }),
      api_static_part(5, {
        attrs: {
          "data-name": $cmp.baz,
        },
      }),
      api_static_part(6, {
        attrs: {
          "data-name": $cmp.bar,
        },
      }),
      api_static_part(7, {
        attrs: {
          "data-name": $cmp.quux,
        },
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
