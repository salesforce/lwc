import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><div${3}>${"t2"}</div><div${3}>${"t4"}</div><div${3}>${"t6"}</div><div${3}>${"t8"}</div><div${3}>${"t10"}</div><div${3}>${"t12"}</div><div${3}>${"t14"}</div><div${3}>${"t16"}</div><div${3}>${"t18"}</div></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(2, null, api_dynamic_text($cmp.noSpace)),
      api_static_part(4, null, api_dynamic_text($cmp.spaceRight) + " "),
      api_static_part(6, null, " " + api_dynamic_text($cmp.spaceLeft)),
      api_static_part(
        8,
        null,
        api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)
      ),
      api_static_part(
        10,
        null,
        " " + api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)
      ),
      api_static_part(
        12,
        null,
        api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two) + " "
      ),
      api_static_part(
        14,
        null,
        api_dynamic_text($cmp.one) + " " + api_dynamic_text($cmp.two)
      ),
      api_static_part(
        16,
        null,
        " " + api_dynamic_text($cmp.one) + " " + api_dynamic_text($cmp.two)
      ),
      api_static_part(
        18,
        null,
        api_dynamic_text($cmp.one) + " " + api_dynamic_text($cmp.two) + " "
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
