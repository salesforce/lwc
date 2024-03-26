import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment2 = parseFragment`<div${3}>${"t1"}<span${3}>text1LwcIf</span></div>`;
const $fragment3 = parseFragment`<div${3}><span${3}>text2LwcIf</span>${"t3"}</div>`;
const $fragment4 = parseFragment`<div${3}><span${3}>text3LwcIf</span>${"t3"}<span${3}>text4LwcIf</span></div>`;
const $fragment5 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment6 = parseFragment`<div${3}>${"t1"}<span${3}>text1LwcElseIf</span></div>`;
const $fragment7 = parseFragment`<div${3}><span${3}>text2LwcElseIf</span>${"t3"}</div>`;
const $fragment8 = parseFragment`<div${3}><span${3}>text3LwcElseIf</span>${"t3"}<span${3}>text4LwcElseIf</span></div>`;
const $fragment9 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment10 = parseFragment`<div${3}>${"t1"}<span${3}>text1LwcElse</span></div>`;
const $fragment11 = parseFragment`<div${3}><span${3}>text2LwcElse</span>${"t3"}</div>`;
const $fragment12 = parseFragment`<div${3}><span${3}>text3LwcElse</span>${"t3"}<span${3}>text4LwcElse</span></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    sp: api_static_part,
    st: api_static_fragment,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.show
      ? api_fragment(
          0,
          [
            api_text(api_dynamic_text($cmp.firstOutterSiblingLwcIf)),
            api_static_fragment($fragment1, 2, [
              api_static_part(1, null, api_dynamic_text($cmp.solo)),
            ]),
            api_static_fragment($fragment2, 4, [
              api_static_part(
                1,
                null,
                api_dynamic_text($cmp.firstInnerSiblingLwcIf)
              ),
            ]),
            api_text(api_dynamic_text($cmp.centerOutterSiblingLwcIf)),
            api_static_fragment($fragment3, 6, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.secondInnerSiblingLwcIf)
              ),
            ]),
            api_static_fragment($fragment4, 8, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.middleInnerSiblingLwcIf)
              ),
            ]),
            api_text(api_dynamic_text($cmp.lastOutterSiblingLwcIf)),
          ],
          0
        )
      : $cmp.showElseIf
      ? api_fragment(
          0,
          [
            api_text(api_dynamic_text($cmp.firstOutterSiblingLwcElseIf)),
            api_static_fragment($fragment5, 10, [
              api_static_part(1, null, api_dynamic_text($cmp.solo)),
            ]),
            api_static_fragment($fragment6, 12, [
              api_static_part(
                1,
                null,
                api_dynamic_text($cmp.firstInnerSiblingLwcElseIf)
              ),
            ]),
            api_text(api_dynamic_text($cmp.centerOutterSiblingLwcElseIf)),
            api_static_fragment($fragment7, 14, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.secondInnerSiblingLwcElseIf)
              ),
            ]),
            api_static_fragment($fragment8, 16, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.middleInnerSiblingLwcElseIf)
              ),
            ]),
            api_text(api_dynamic_text($cmp.lastOutterSiblingLwcElseIf)),
          ],
          0
        )
      : api_fragment(
          0,
          [
            api_text(api_dynamic_text($cmp.firstOutterSiblingLwcElse)),
            api_static_fragment($fragment9, 18, [
              api_static_part(1, null, api_dynamic_text($cmp.solo)),
            ]),
            api_static_fragment($fragment10, 20, [
              api_static_part(
                1,
                null,
                api_dynamic_text($cmp.firstInnerSiblingLwcElse)
              ),
            ]),
            api_text(api_dynamic_text($cmp.centerOutterSiblingLwcElse)),
            api_static_fragment($fragment11, 22, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.secondInnerSiblingLwcElse)
              ),
            ]),
            api_static_fragment($fragment12, 24, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.middleInnerSiblingLwcElse)
              ),
            ]),
            api_text(api_dynamic_text($cmp.lastOutterSiblingLwcElse)),
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
