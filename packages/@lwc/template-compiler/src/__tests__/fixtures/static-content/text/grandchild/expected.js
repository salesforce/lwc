import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><div${3}>${"t2"}</div></div>`;
const $fragment2 = parseFragment`<div${3}><div${3}>${"t2"}<span${3}>text1</span></div><div${3}><span${3}>text2</span>${"t8"}<span${3}>text3</span></div><div${3}><span${3}>text4</span><span${3}>text5</span>${"t16"}</div><div${3}>${"t18"}</div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(2, null, api_dynamic_text($cmp.soloGrandChild)),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(2, null, api_dynamic_text($cmp.grandChildFirstSibling)),
      api_static_part(8, null, api_dynamic_text($cmp.grandChildSecondSibling)),
      api_static_part(16, null, api_dynamic_text($cmp.grandChildLastSibling)),
      api_static_part(
        18,
        null,
        "concatenate the " + api_dynamic_text($cmp.string) + " value"
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
