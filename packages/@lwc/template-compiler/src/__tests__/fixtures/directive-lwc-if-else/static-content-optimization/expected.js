import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${"a0:data-dynamic"}${3}></span>`;
const $fragment2 = parseFragment`<span data-static="staticInsideIf"${3}></span>`;
const $fragment3 = parseFragment`<span${3}>${"t1"}</span>`;
const $fragment4 = parseFragment`<span${"a0:data-dynamic"}${3}></span>`;
const $fragment5 = parseFragment`<span data-static="staticInsideElseIf"${3}></span>`;
const $fragment6 = parseFragment`<span${3}>${"t1"}</span>`;
const $fragment7 = parseFragment`<span${"a0:data-dynamic"}${3}></span>`;
const $fragment8 = parseFragment`<span data-static="staticInsideElse"${3}></span>`;
const $fragment9 = parseFragment`<span${3}>${"t1"}</span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    sp: api_static_part,
    st: api_static_fragment,
    d: api_dynamic_text,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.showIf
      ? api_fragment(
          0,
          [
            api_static_fragment($fragment1, 2, [
              api_static_part(
                0,
                {
                  attrs: {
                    "data-dynamic": $cmp.insideIf,
                  },
                },
                null
              ),
            ]),
            api_static_fragment($fragment2, 4),
            api_static_fragment($fragment3, 6, [
              api_static_part(
                1,
                null,
                "concatenated " + api_dynamic_text($cmp.insideIf)
              ),
            ]),
          ],
          0
        )
      : $cmp.showElseIf
      ? api_fragment(
          0,
          [
            api_static_fragment($fragment4, 8, [
              api_static_part(
                0,
                {
                  attrs: {
                    "data-dynamic": $cmp.insideElseIf,
                  },
                },
                null
              ),
            ]),
            api_static_fragment($fragment5, 10),
            api_static_fragment($fragment6, 12, [
              api_static_part(
                1,
                null,
                "concatenated " + api_dynamic_text($cmp.insideElseIf)
              ),
            ]),
          ],
          0
        )
      : api_fragment(
          0,
          [
            api_static_fragment($fragment7, 14, [
              api_static_part(
                0,
                {
                  attrs: {
                    "data-dynamic": $cmp.insideElse,
                  },
                },
                null
              ),
            ]),
            api_static_fragment($fragment8, 16),
            api_static_fragment($fragment9, 18, [
              api_static_part(
                1,
                null,
                "concatenated " + api_dynamic_text($cmp.insideElse)
              ),
            ]),
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
