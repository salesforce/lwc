import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><!-- level 1--><span${3}>some <!-- level 2 --> text</span><div${3}>${"t7"}<!-- level 3 -->${"t9"}<span${3}><!-- level 4 -->${"t12"}</span><div${3}>text <!-- level 5 -->${"t16"}</div></div></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(7, null, api_dynamic_text($cmp.dynamic) + " "),
      api_static_part(9, null, " " + api_dynamic_text($cmp.text)),
      api_static_part(12, null, " " + api_dynamic_text($cmp.dynamic) + " text"),
      api_static_part(16, null, " " + api_dynamic_text($cmp.dynamic)),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
