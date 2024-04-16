import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${"a0:aria-described-by"}${"a0:aria-active-descendant"}${"a0:aria-error-message"}${"a0:aria-flow-to"}${"a0:aria-labelled-by"}${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          attrs: {
            "aria-described-by": $cmp.scoped,
            "aria-active-descendant": $cmp.scoped,
            "aria-error-message": $cmp.scoped,
            "aria-flow-to": $cmp.scoped,
            "aria-labelled-by": $cmp.scoped,
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
