import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment2 = parseFragment`<div${3}>${"t1"}<span${3}>text1</span></div>`;
const $fragment3 = parseFragment`<div${3}><span${3}>text2</span>${"t3"}</div>`;
const $fragment4 = parseFragment`<div${3}><span${3}>text3</span>${"t3"}<span${3}>text4</span></div>`;
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
            api_text(api_dynamic_text($cmp.firstOutterSibling)),
            api_static_fragment($fragment1, 2, [
              api_static_part(1, null, api_dynamic_text($cmp.solo)),
            ]),
            api_static_fragment($fragment2, 4, [
              api_static_part(
                1,
                null,
                api_dynamic_text($cmp.firstInnerSibling)
              ),
            ]),
            api_text(api_dynamic_text($cmp.centerOutterSibling)),
            api_static_fragment($fragment3, 6, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.secondInnerSibling)
              ),
            ]),
            api_static_fragment($fragment4, 8, [
              api_static_part(
                3,
                null,
                api_dynamic_text($cmp.middleInnerSibling)
              ),
            ]),
            api_text(api_dynamic_text($cmp.lastOutterSibling)),
          ],
          0
        )
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
