import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${"a0:data-dynamic"}${3}></span>`;
const $fragment2 = parseFragment`<span data-static="staticInsideIf"${3}></span>`;
const $fragment3 = parseFragment`<span${"a0:data-dynamic"}${3}></span>`;
const $fragment4 = parseFragment`<span data-static="staticInsideElseIf"${3}></span>`;
const $fragment5 = parseFragment`<span${"a0:data-dynamic"}${3}></span>`;
const $fragment6 = parseFragment`<span data-static="staticInsideElse"${3}></span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    sp: api_static_part,
    st: api_static_fragment,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.showIf
      ? api_fragment(
          0,
          [
            api_static_fragment($fragment1, 2, [
              api_static_part(0, {
                attrs: {
                  "data-dynamic": $cmp.insideIf,
                },
              }),
            ]),
            api_static_fragment($fragment2, 4),
          ],
          0
        )
      : $cmp.showElseIf
      ? api_fragment(
          0,
          [
            api_static_fragment($fragment3, 6, [
              api_static_part(0, {
                attrs: {
                  "data-dynamic": $cmp.insideElseIf,
                },
              }),
            ]),
            api_static_fragment($fragment4, 8),
          ],
          0
        )
      : api_fragment(
          0,
          [
            api_static_fragment($fragment5, 10, [
              api_static_part(0, {
                attrs: {
                  "data-dynamic": $cmp.insideElse,
                },
              }),
            ]),
            api_static_fragment($fragment6, 12),
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
