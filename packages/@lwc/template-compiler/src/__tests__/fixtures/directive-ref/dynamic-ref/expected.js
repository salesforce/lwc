import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${"a0:dynamic"}${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          ref: "foo",
          attrs: {
            dynamic: $cmp.dynamic,
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
