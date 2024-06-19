import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>${"t1"}<span${3}>${"t3"}</span>${"t4"}<span${3}>${"t6"}</span>${"t7"}<span${3}>${"t9"}</span></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        null,
        " some " + api_dynamic_text($cmp.dynamic) + " text"
      ),
      api_static_part(3, null, " " + api_dynamic_text($cmp.dynamic) + " text"),
      api_static_part(
        4,
        null,
        "some " + api_dynamic_text($cmp.dynamic) + " " + " text"
      ),
      api_static_part(
        6,
        null,
        "some " + api_dynamic_text($cmp.dynamic) + " " + " text"
      ),
      api_static_part(
        7,
        null,
        "some " + api_dynamic_text($cmp.dynamic) + " text "
      ),
      api_static_part(
        9,
        null,
        "some " + api_dynamic_text($cmp.dynamic) + " text "
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
