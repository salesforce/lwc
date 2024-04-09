import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment2 = parseFragment`<div${3}>${"t1"}<span${3}>text1</span></div>`;
const $fragment3 = parseFragment`<div${3}><span${3}>text2</span>${"t3"}</div>`;
const $fragment4 = parseFragment`<div${3}><span${3}>text3</span>${"t3"}<span${3}>text4</span></div>`;
const $fragment5 = parseFragment`<div${3}>${"t1"}</div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_text(api_dynamic_text($cmp.firstOutterSibling)),
    api_static_fragment($fragment1, 1, [
      api_static_part(1, null, api_dynamic_text($cmp.solo)),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(1, null, api_dynamic_text($cmp.firstInnerSibling)),
    ]),
    api_text(api_dynamic_text($cmp.centerOutterSibling)),
    api_static_fragment($fragment3, 5, [
      api_static_part(3, null, api_dynamic_text($cmp.secondInnerSibling)),
    ]),
    api_static_fragment($fragment4, 7, [
      api_static_part(3, null, api_dynamic_text($cmp.middleInnerSibling)),
    ]),
    api_static_fragment($fragment5, 9, [
      api_static_part(
        1,
        null,
        "String concat " + api_dynamic_text($cmp.middleInnerSibling) + " value"
      ),
    ]),
    api_text(api_dynamic_text($cmp.lastOutterSibling)),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
